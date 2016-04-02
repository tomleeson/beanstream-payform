(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function InputView(model, template, domParentElements) {
        this._model = model;
        this._template = template;
        this._domParentElements = domParentElements;

        // this._domParentElement = domParentElements;
        if (domParentElements.form) {
            this._domParentElement = domParentElements.form;
        }

        this.keydown = new beanstream.Event(this);
        this.keyup = new beanstream.Event(this);
        this.paste = new beanstream.Event(this);
        this.blur = new beanstream.Event(this);
        this.focus = new beanstream.Event(this);

        var _this = this;

        // attach model Listeners
        this._model.valueChanged.attach(function() {
            _this.render('value', '');
        });
        this._model.cardTypeChanged.attach(function() {
            _this.render('cardType', '');
        });
        this._model.validityChanged.attach(function() {
            _this.render('isValid', '');
        });
    }

    InputView.prototype = {
        render: function(viewCmd, parameter) {
            var _this = this;
            var viewCommands = {
                elements: function() {
                    var template = _this._template.show(parameter);
                    var inputFrag = _this.createDocFrag(template.input);
                    var labelFrag = _this.createDocFrag(template.label);
                    var errorFrag = _this.createDocFrag(template.error);

                    if (parameter.inputDomTargets) {
                        // If a dom target is found do not append label
                        _this._domParentElements.input.appendChild(inputFrag);
                    } else {
                        _this._domParentElements.form.appendChild(labelFrag);
                        _this._domParentElements.form.appendChild(inputFrag);
                    }

                    if (parameter.errorDomTargets) {
                        _this._domParentElements.error.appendChild(errorFrag);
                    } else if (!parameter.errorDomTargets && parameter.inputDomTargets) {
                        _this._domParentElements.input.appendChild(errorFrag);
                    } else {
                        _this._domParentElements.form.appendChild(errorFrag);
                    }
                    _this.cacheDom(parameter.id);

                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domInputElement.value = _this._model.getValue();

                    // Do not reposition caret for date
                    if (_this._model.getFieldType() !== 'cc-exp') {
                        var pos =  _this._model.getCaretPos();
                        _this._domInputElement.setSelectionRange(pos, pos);
                    }
                },
                cardType: function() {
                    var fieldType = _this._model.getFieldType();

                    if (fieldType === 'cc-number') {
                        var cardType = _this._model.getCardType();

                        if (cardType) {
                            if (cardType === 'maestro') {
                                cardType = 'mastercard';
                            }
                            if (cardType === 'visaelectron') {
                                cardType = 'visa';
                            }
                            _this._domInputElement.style.backgroundImage =
                                'url(http://downloads.beanstream.com/images/payform/' + cardType + '.png)';
                        } else {
                            _this._domInputElement.style.backgroundImage =
                                'url(http://downloads.beanstream.com/images/payform/card.png)';
                        }
                    }
                },
                csc: function() {
                    var fieldType = _this._model.getFieldType();

                    if (fieldType === 'cc-csc') {
                        var cardType = _this._model.getCardType();
                        var onBlur = parameter;

                        if (cardType && cardType === 'amex') {
                            if (!onBlur) {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_color_amex.png)';
                            } else {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_mono_amex.png)';
                            }
                        } else if (cardType) {
                            if (!onBlur) {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_color.png)';
                            } else {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_mono.png)';
                            }
                        }
                    }
                },
                isValid: function() {
                    var isValid = _this._model.getIsValid();

                    if (isValid) {
                        _this._domInputElement.classList.remove('beanstream_invalid');
                    } else {
                        _this._domInputElement.classList.add('beanstream_invalid');
                    }
                    _this._domErrorElement.innerHTML = _this._model.getError();
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            this._domInputElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + ']');
            this._domErrorElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + '_error]');
        },
        attachDomListeners: function() {
            var _this = this;

            this._domInputElement.addEventListener('keydown', function(e) {
                e = e || window.event;
                _this.keydown.notify(e);
            }, false);
            this._domInputElement.addEventListener('keyup', function(e) {
                e = e || window.event;
                var args = {event: e, inputValue: _this._domInputElement.value};
                _this.keyup.notify(args);
            }, false);
            this._domInputElement.addEventListener('paste', function(e) {
                e = e || window.event;
                _this.paste.notify(e);
            }, false);
            this._domInputElement.addEventListener('blur', function(e) {
                e = e || window.event;
                _this.blur.notify(e);
            }, false);
            this._domInputElement.addEventListener('focus', function(e) {
                e = e || window.event;
                _this.focus.notify(e);
            }, false);
        },
        createDocFrag: function(htmlStr) {
            // http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
            var frag = document.createDocumentFragment();
            var temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        },
        getCaretOffset: function(el) {
            // http://stackoverflow.com/a/2897229/6011159
            var el = this._domInputElement;
            var pos = 0;

            // IE Support
            if (document.selection) {
                var sel = document.selection.createRange();
                sel.moveStart('character', -el.value.length);
                pos = sel.text.length;
            }

            // Firefox support
            else if (el.selectionStart || el.selectionStart == '0') {
                pos = el.selectionStart;
            }

            return pos;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputView = InputView;
})(window);
