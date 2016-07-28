(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function InputController(model, view, config) {
        var self = this;
        self._model = model;
        self._view = view;
        self._config = config;

        self._model.setFieType(self._config.autocomplete);

        self.cardTypeChanged = new beanstream.Event(this);
        self.inputComplete = new beanstream.Event(this);
        self.inputValidityChanged = new beanstream.Event(this);

        // notifier for view
        self._view.render('elements', self._config);

        self._model.cardTypeChanged.attach(function(sender, args) {
            var cardType = self._model.getCardType();
            // emit event for form to rely to cvv field
            self.cardTypeChanged.notify(cardType);
        });

        self._view.input.attach(function(sender, args) {
            self.formatInput(args.inputValue, args.caretAtEndOfStr, args.caretPos);
        });

        self._view.blur.attach(function(sender, e) {
            var onBlur = true;
            self.validate(onBlur);
        });

        self._view.focus.attach(function(sender, e) {
            var str = self._model.getValue();

            if (self._model.getFieldType() === 'cc-csc') {
                var onBlur = false;
                self._view.render('csc', false);
            }
        });
    }

    InputController.prototype = {
        formatInput: function(str, caretAtEndOfStr, caretPos) {
            var self = this;

            // 1. format input string
            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    str = beanstream.Validator.formatCardNumber(str);
                    break;
                }
                case 'cc-csc': {
                    str = beanstream.Validator.limitLength(str, 'cvcLength', self._model.getCardType());
                    break;
                }
                case 'cc-exp': {
                    str = beanstream.Validator.formatExpiry(str);
                    break;
                }
                default: {
                    break;
                }
            }

            // 2. set the updated caret position on the UI
            if (caretAtEndOfStr) {
                caretPos = str.length;
            } else {
                caretPos = self.incrementCaretPos(str, caretPos);
            }
            self._model.setCaretPos(caretPos);

            // 3. set the formatted string to the UI
            self._model.setValue(str);

            // 4. validate the input
            var onBlur = false;
            self.validate(onBlur);

            // 5. move focus to next element if current element is valid
            if (self._model.getIsValid()) {
                var cardType = self._model.getCardType();
                if (cardType !== '' || self._model.getFieldType() === 'cc-exp') {
                    self.updateFocus(str, self._model.getCardType());
                }
            }
        },
        incrementCaretPos: function(str, caretPos) {
            var self = this;

            if (str.substring(caretPos - 1, caretPos) === ' ' ||
            str.substring(caretPos - 1, caretPos) === '/') {
                caretPos += 1;
                caretPos = self.incrementCaretPos(str, caretPos);
            }

            return caretPos;
        },
        setInputValidity: function(args) {
            var self = this;
            self._model.setError(args.error);
            self._model.setIsValid(args.isValid);
            self.inputValidityChanged.notify(args);
        },
        updateFocus: function(str, cardType) {
            var self = this;
            var max;
            str = str.replace(/\s+/g, ''); // remove white spaces from string
            var len = str.length;

            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    max = beanstream.Validator.getMaxLength('length', cardType);
                    break;
                }
                case 'cc-csc': {
                    max = beanstream.Validator.getMaxLength('cvcLength', cardType);
                    break;
                }
                case 'cc-exp': {
                    max = 7; // Format: "MM / YYYY", minus white spacing
                    break;
                }
                default: {
                    break;
                }
            }

            if (max === len) {
                self.inputComplete.notify();
            }
        },
        validate: function(onBlur) {
            var self = this;
            var value = self._model.getValue();

            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    var cardType = beanstream.Validator.getCardType(value);
                    self._model.setCardType(cardType);
                    var isValid = beanstream.Validator.isValidCardNumber(value, onBlur);
                    self.setInputValidity(isValid);
                    break;
                }
                case 'cc-csc': {
                    var cardType = self._model.getCardType();
                    var isValid = beanstream.Validator.isValidCvc(cardType, value, onBlur);
                    self.setInputValidity(isValid);
                    self._view.render('csc', onBlur);
                    break;
                }
                case 'cc-exp': {
                    var isValid = beanstream.Validator.isValidExpiryDate(value, new Date(), onBlur);
                    self.setInputValidity(isValid);
                    break;
                }
                default: {
                    break;
                }
            }

        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);
