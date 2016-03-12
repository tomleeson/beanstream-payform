
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

        self.cardTypeChanged = new beanstream.Event(this);

        //notifier for view 
        self._view.render("elements", self._config);

        //listen to view events
        self._view.keydown.attach(function(sender, e) {
            if(beanstream.Helper.isNonInputKey(e)){
                // Don't override default functionality except for input
                return;
            }
            e.preventDefault();

            var char = String.fromCharCode(e.keyCode);

            var selectedText = {};
            selectedText.start = e.target.selectionStart;
            selectedText.end = e.target.selectionEnd;

            self.limitInput(char, selectedText);
        });

        self._view.keyup.attach(function(sender, args) {
            if(args.event.keyCode === 8 || args.event.keyCode === 46){
                //Update model directly from UI on delete
                //keyup is only needed for deletion
                self._model.setValue(args.inputValue);
                
                if(self._config.autocomplete === "cc-number"){
                    var cardType = beanstream.Validator.getCardType(args.inputValue);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.getLuhnChecksum(newStr);
                    self._model.setIsValid(isValid);
                }
                if(self._config.autocomplete === "cc-exp"){
                    var isValid = beanstream.Validator.isValidExpiryDate(args.inputValue, new Date());
                    self._model.setIsValid(isValid);
                }
            }
        });

        self._view.paste.attach(function(sender, e) {
            e.preventDefault();

            var pastedStr = e.clipboardData.getData('text/plain');

            var selectedText = {};
            selectedText.start = e.target.selectionStart;
            selectedText.end = e.target.selectionEnd;

            self.limitInput(pastedStr, selectedText);
        });
    }

    InputController.prototype = {

        limitInput: function(str, selectedText) {
            var self = this;

            str = str.replace(/\D/g,''); // remove non ints from string

            if(!str.length){
                return;
            }

            // Remove any text selected in ui
            var currentStr = self._model.getValue();
            currentStr =  currentStr.replace(
                            currentStr.substring(
                                selectedText.start, selectedText.end), "");

            var newStr = currentStr + str;

            switch(self._config.autocomplete) {
                case "cc-number":
                    newStr = beanstream.Validator.formatCardNumber(newStr);
                    var cardType = beanstream.Validator.getCardType(newStr);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.getLuhnChecksum(newStr);
                    self._model.setIsValid(isValid);
                    break;
                case "cc-csc":
                    // See note in Validator.limitLength
                    console.log();
                    newStr = beanstream.Validator.limitLength(newStr, "cvcLength", self._config.cardType);
                    break;
                case "cc-exp":
                    newStr = beanstream.Validator.formatExpiry(newStr);
                    var isValid = beanstream.Validator.isValidExpiryDate(newStr, new Date());
                    self._model.setIsValid(isValid);
                    break;
                default:
                    break;
            }
            
            self._model.setValue(newStr);
        },

        setCardType: function(cardType) {
            var self = this;  
            var currentType = self._model.setCardType(cardType);   
            if(cardType != currentType ){   
                self._model.setCardType(cardType); // update model for viey
                self.cardTypeChanged.notify(cardType); //emit event for form
            }
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);