
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = "";
        this._isValid = false;

        this.valueChanged = new beanstream.Event(this);
        this.validityChanged = new beanstream.Event(this);
    }

    InputModel.prototype = {

        getValue: function() {
            return this._value;
        },
        setValue: function(value) {
            this._value = value;
            this.valueChanged.notify();
        },
        getIsValid: function() {
            return this._isValid;
        },
        setIsValid: function(valid) {
            this._isValid = valid;
            this.validityChanged.notify();
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputModel = InputModel;
})(window);