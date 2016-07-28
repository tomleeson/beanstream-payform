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

        this.blur = new beanstream.Event(this);
        this.focus = new beanstream.Event(this);
        this.input = new beanstream.Event(this);

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
                        // don't append an error if...
                        // _this._domParentElements.input.appendChild(errorFrag);
                    } else {
                        _this._domParentElements.form.appendChild(errorFrag);
                    }
                    _this.cacheDom(parameter.id);

                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domInputElement.value = _this._model.getValue();

                    var pos =  _this._model.getCaretPos();
                    _this._domInputElement.setSelectionRange(pos, pos);
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
                            _this._domInputElement.classList.add('amex');
                        } else {
                            _this._domInputElement.classList.remove('amex');
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
                    if (_this._domErrorElement) {
                        _this._domErrorElement.innerHTML = _this._model.getError();
                    }
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            this._domInputElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + ']');
            this._domErrorElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + '_error]');
        },
        attachDomListeners: function() {
            var self = this;
            var el = self._domInputElement;

            if (el.addEventListener) {
                el.addEventListener('keydown', self.handleKeydown, false);
                el.addEventListener('blur', self.handleBlur.bind(self), false);
                el.addEventListener('focus', self.handleFocus.bind(self), false);

                if (!document.body.classList.contains('lt-ie9')) {
                    // IE 9 does not fire an input event when the user deletes characters from an input
                    // https://developer.mozilla.org/en-US/docs/Web/Events/input#Browser_compatibility
                    el.addEventListener('input', self.handleInput.bind(self), false);
                }

            } else if (el.addEventListener && document.body.classList.contains('lt-ie9')) {
                // IE 9 does not fire an input event when the user deletes characters from an input
                // https://developer.mozilla.org/en-US/docs/Web/Events/input#Browser_compatibility
                el.attachEvent('onpropertychange', self.handleInput.bind(self));
            } else if (el.attachEvent) {
                // < IE 9, use attachEvent rather than the standard addEventListener
                el.attachEvent('onkeydown', self.handleKeydown);
                el.attachEvent('onblur', self.handleBlur.bind(self));
                el.attachEvent('onfocus', self.handleFocus.bind(self));
                el.attachEvent('onpropertychange', self.handleInput.bind(self));
            }
        },
        handleKeydown: function(e) {
            e = e || window.event;
            if (e && !(e.ctrlKey || e.metaKey)) {
                var key = e.charCode || e.keyCode;
                var keychar = String.fromCharCode(key);
                var allowedControlKeyCodes = [null, 0, 8, 9, 13, 27, 37, 39];
                var allowedKeys = '0123456789. ';

                if (allowedControlKeyCodes.indexOf(key) > -1 ||
                    allowedKeys.indexOf(keychar) > -1) {
                    return true;
                } else {
                    e.preventDefault();
                    return false;
                }
            } else {
                return true;
            }
        },
        handleBlur: function(e) {
            // validation is updated onBlur
            var self = this;
            e = e || window.event;
            self.blur.notify(e);
        },
        handleFocus: function(e) {
            var self = this;
            // icon in cvc field is updated onFocus
            e = e || window.event;
            self.focus.notify(e);
        },
        handleInput: function(e) {
            var self = this;
            e = e || window.event;
            var caretPos = 0;
            if ('selectionStart' in self._domInputElement) {
                caretPos = self._domInputElement.selectionStart;
            } else if (document.selection) {
                // < IE 9 selectionStart not supported
                // http://stackoverflow.com/a/2897229

                // To get cursor position, get empty selection range
                var oSel = document.selection.createRange();
                // Move selection start to 0 position
                oSel.moveStart('character', -oField.value.length);
                // The caret position is selection length
                caretPos = oSel.text.length;
            }

            var caretAtEndOfStr = self._domInputElement.value.length === caretPos;
            var args = {event: e,
                        inputValue: self._domInputElement.value,
                        caretPos: caretPos,
                        caretAtEndOfStr: caretAtEndOfStr};
            self.input.notify(args);
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
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputView = InputView;
})(window);
