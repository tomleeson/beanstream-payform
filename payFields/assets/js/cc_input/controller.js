
(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function InputController(model, view, config) {

        this._model = model;
        this._view = view;
        this._config = config;

        var _this = this;

        //notifier for view 
        this._view.render("elements", this._config);

        //listen to view events
        this._view.keydown.attach(function(e) {
            //console.log("view.keydown");

            // Don't override default functionality except for input
            /*
            if(helper.isNonInputKey(e)){
                return;
             }
            e.preventDefault();
            */

            _this.limitInput(event.keyCode);
        });

        this._view.paste.attach(function(e) {
            //console.log("view.paste");
            _this.limitPaste(e);
        });
    }

    InputController.prototype = {

        limitInput: function(keyCode) {
            //console.log("InputController.limitInput");

            // 1. verify keypress from relevant key

            var newChar = String.fromCharCode(keyCode);
            var str = this._model.getValue() + newChar;

            // 2. validate new str

            this._model.setValue(str);

            //console.log(this._model.getValue());
        },

        limitPaste: function(e) {
            //console.log("InputController.limitInput");
        }

    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);