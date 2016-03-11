
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

        self._view.paste.attach(function(e) {
            //console.log("view.paste");
            //_self.limitPaste(e);
        });
    }

    InputController.prototype = {

        limitInput: function(char, selectedText) {
            var self = this;

            if(isNaN(char)){
                return;
            }

            // Remove any text selected in ui
            var currentStr = self._model.getValue();
            currentStr =  currentStr.replace(
                            currentStr.substring(
                                selectedText.start, selectedText.end), "");

            var newStr = currentStr + char;

            switch(self._config.autocomplete) {
                case "cc-number":
                    newStr = beanstream.Validator.formatCardNumber(newStr);

                    break;
                case "cc-csc":
                    // See note in Validator.limitLength
                    //newStr = beanstream.Validator.limitLength(newStr, "cvcLength");
                    break;
                case "cc-exp":
                    newStr = beanstream.Validator.formatExpiry(newStr);
                    break;
                default:
                    newStr = currentStr + char;
            }
            
            self._model.setValue(newStr);
        },

        limitPaste: function(e) {
            var self = this;

            //console.log("InputController.limitInput");
        }

    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);