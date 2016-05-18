(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function FormController(model, view) {
        var self = this;
        self._model = model;
        self._view = view;

        self._view.init();
        self._view.submit.attach(function(sender, e) {
            self.onSubmit(e);
        });
    }

    FormController.prototype = {
        init: function() {
            var self = this;

            // This path is update for production and staging by gulp script
            self._view.render('injectStyles',
                'http://localhost:8000/payfields/assets/css/beanstream_payfields_style.css');

            self.injectFields();

            beanstream.Helper.fireEvent('beanstream_payfields_loaded', {}, document);
        },
        onSubmit: function(e) {
            var self = this;
            e.preventDefault();

            self.validateFields();
            var fields = self.getFieldValues();

            if (!beanstream.Helper.isEmpty(fields)) {
                self._view.render('enableSubmitButton', 'false');

                var data = {'number': fields.number,
                        'expiry_month': fields.expiryMonth,
                        'expiry_year': fields.expiryYear,
                        'cvd': fields.cvd};

                var ajaxHelper = new beanstream.AjaxHelper();
                ajaxHelper.getToken(data, function(args) {
                    if (args.success) {
                        self._view.render('appendToken', args.token);
                    } else {
                        console.log('Warning: tokenisation failed. Code: ' + args.code + ', message: ' + args.message);
                    }

                    if (this._model.getSubmitForm()) {
                        self._view.form.submit();
                    } else {
                        beanstream.Helper.fireEvent('beanstream_payfields_tokenUpdated', args, document);
                    }
                    self._view.render('enableSubmitButton', 'true');
                }.bind(self));
            } else {
                self._view.render('enableSubmitButton', 'true');
            }
        },
        appendToken: function(form, value) {
            var input = form.querySelector('input[name=singleUseToken]');

            if (input) {
                input.value = value;
            } else {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'singleUseToken';
                input.value = value;
                form.appendChild(input);
            }
        },
        injectFields: function(filename) {
            this.fieldObjs = [];

            var fields = this._model.getFields();

            for (var field in fields) {
                var domTargets = {};
                if (this._model.getDomTargetsFound('inputs')) {
                    domTargets.input = this._view.domTargets[field + '_input'];
                }
                if (this._model.getDomTargetsFound('errors')) {
                    domTargets.error = this._view.domTargets[field + '_error'];
                }
                domTargets.form = this._view.form;

                var config = new Object;
                config.inputDomTargets = this._model.getDomTargetsFound('inputs');
                config.errorDomTargets = this._model.getDomTargetsFound('errors');
                config.id = field;
                config.name = fields[field].name;
                config.labelText = fields[field].labelText;
                config.placeholder = fields[field].placeholder;
                config.autocomplete = fields[field].autocomplete;
                var f = {};
                f.model = new beanstream.InputModel();
                f.template = new beanstream.InputTemplate();
                f.view = new beanstream.InputView(f.model, f.template, domTargets);
                f.controller = new beanstream.InputController(f.model, f.view, config);

                this.fieldObjs.push(f);
            }

            // register listener on controller for cardType changed
            var field = this.fieldObjs.filter(function(f) {
                return f.controller._config.id === 'ccNumber';
            });
            field = field[0];

            // attach listeners to new field
            var self = this;

            if (field) {
                field.controller.cardTypeChanged.attach(function(sender, cardType) {
                    self.setCardType(cardType);
                    beanstream.Helper.fireEvent('beanstream_payfields_cardTypeChanged',
                        {'cardType': cardType}, document);
                }.bind(self));
            }

            for (field in this.fieldObjs) {
                this.fieldObjs[field].controller.inputComplete.attach(function(sender) {
                    self._view.render('setFocusNext', sender);
                }.bind(self));

                this.fieldObjs[field].controller.inputValidityChanged.attach(function(sender, args) {
                    self.inputValidityChanged(args);
                }.bind(self));
            }
        },
        setCardType: function(cardType) {
            var field = this.fieldObjs.filter(function(f) {
                    return f.controller._config.id === 'ccCvv';
                });
            field = field[0];

            if (field) {
                field.controller.setCardType(cardType);
            }
        },
        inputValidityChanged: function(args) {
            beanstream.Helper.fireEvent('beanstream_payfields_inputValidityChanged', args, document);
        },
        /**
        * Gets card field values from model
        * Returns {} if invalid or empty
        */
        getFieldValues: function() {
            var data = {};

            var invalidFields = this.fieldObjs.filter(function(f) {
                return f.controller._model.getIsValid() === false;
            });

            var emptyFields = this.fieldObjs.filter(function(f) {
                return f.controller._model.getValue() === '';
            });

            if (invalidFields.length === 0 && emptyFields.length === 0) {
                for (var i = 0; i < this.fieldObjs.length; i++) {
                    switch (this.fieldObjs[i].controller._config.id) {
                        case 'ccNumber': {
                            data.number = this.fieldObjs[i].controller._model.getValue();
                            break;
                        }
                        case 'ccCvv': {
                            data.cvd = this.fieldObjs[i].controller._model.getValue();
                            break;
                        }
                        case 'ccExp': {
                            var str = this.fieldObjs[i].controller._model.getValue();
                            var arr = str.split('/');
                            data.expiryMonth = arr[0].trim();
                            data.expiryYear = '20' + arr[1].trim();
                            break;
                        }
                        default: {
                            break;
                        }
                    }

                    this.fieldObjs[i].controller._model.setValue('');
                }
            }

            return data;
        },
        validateFields: function() {
            var self = this;
            var onBlur = true;
            for (var i = 0; i < self.fieldObjs.length; i++) {
                self.fieldObjs[i].controller.validate(onBlur);
            }
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormController = FormController;
})(window);
