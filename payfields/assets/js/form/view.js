(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function FormView(model) {
        this._model = model;
        this.submit = new beanstream.Event(this);
    }

    FormView.prototype = {
        init: function() {
            var self = this;
            self.cacheDom();
            self.readAttributes();
            self.attachDomListeners();
        },
        cacheDom: function(id) {
            // http://stackoverflow.com/a/22745553
            // there may be multiple forms in a page, get ref to current form
            var scripts = document.getElementsByTagName('script');
            this.script = scripts[scripts.length - 1];
            this.form = this.script.parentNode;
            this.head = document.getElementsByTagName('head')[0];
            this.submitBtn = this.form.querySelector('input[type=submit]');

            var urlArray = this.script.src.split('/');
            this.host = urlArray[0] + '//' + urlArray[2];

            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelector('button[type=submit]');
            }

            this.domTargets = {};

            var fields = this._model.getFields();

            for (var field in fields) {
                var input = field + '_input';
                var error = field + '_error';

                this.domTargets[input] =
                    this.form.querySelector('[data-beanstream-target=' + input + ']');

                this.domTargets[error] =
                    this.form.querySelector('[data-beanstream-target=' + error + ']');

                // Set flags. If target missing for any input, ignore all input targets
                this._model.setDomTargetsFound('inputs', true);
                this._model.setDomTargetsFound('errors', true);

                if (this.domTargets[input] === null) {
                    this._model.setDomTargetsFound('inputs', false);
                }
                if (this.domTargets[error] === null) {
                    this._model.setDomTargetsFound('errors', false);
                }
            }
        },
        readAttributes: function() {
            var self = this;
            var submit = self.script.getAttribute('data-submitForm') === 'true';
            this._model.setSubmitForm(submit);
        },
        attachDomListeners: function() {
            var self = this;
            window.onload = function(e) {
                // validate and get token before submit event
                // button is below script tag, so we wait until it loads
                // toDo: change put button above script tag. drop onload event???
                self.submitBtn = self.form.querySelector('input[type=submit]');
                if (!self.submitBtn) {
                    self.submitBtn = self.form.querySelector('button[type=submit]');
                }

                // if there is no submit button don't submit
                if (self.submitBtn) {
                    self.submitBtn.addEventListener('click', function(e) {
                        self.submit.notify(e);
                    }, false);
                }

                self.form.addEventListener('beanstream_payfields_tokenize', function(e) {
                    self.submit.notify(e);
                }.bind(self), false);

            }.bind(self);
        },
        render: function(viewCmd, parameter) {
            var self = this;
            var viewCommands = {
                enableSubmitButton: function(parameter) {
                    if (self.submitBtn) {
                        self.submitBtn.disabled = Boolean(!parameter);
                    }
                },
                injectStyles: function(parameter) {
                    var fileref = document.createElement('link');
                    fileref.setAttribute('rel', 'stylesheet');
                    fileref.setAttribute('type', 'text/css');
                    fileref.setAttribute('href', parameter);

                    if (typeof fileref !== 'undefined') {
                        self.head.appendChild(fileref);
                    }
                },
                appendToken: function(value) {
                    var input = self.form.querySelector('input[name=singleUseToken]');

                    if (input) {
                        input.value = value;
                    } else {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'singleUseToken';
                        input.value = value;
                        self.form.appendChild(input);
                    }
                },
                setFocusNext: function(sender) {
                    var currentEl = sender._config.id;

                    // toDo: these inputs should be cached
                    var inputs = self.form.getElementsByTagName('input');

                    var currentInput = self.getIndexById(inputs, currentEl);

                    if (inputs[currentInput + 1]) {
                        inputs[currentInput + 1].focus();
                    } else {
                        if (self.submitBtn) {
                            self.submitBtn.focus();
                        }
                    }
                }
            };

            viewCommands[viewCmd](parameter);
        },
        getIndexById: function(source, id) {
            for (var i = 0; i < source.length; i++) {
                if (source[i].getAttribute('data-beanstream-id') === id) {
                    return i;
                }
            }
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormView = FormView;
})(window);
