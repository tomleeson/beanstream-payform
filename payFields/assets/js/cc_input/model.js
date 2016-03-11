
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = "";
        this._isValid = true;

        this.valueChanged = new beanstream.Event(this);
        this.validityChanged = new beanstream.Event(this);
        this.cardTypeChanged = new beanstream.Event(this);
    }

    InputModel.prototype = {

        getValue: function() {
            return this._value;
        },
        setValue: function(value) {
            if(value != this._value){
                this._value = value;
                this.valueChanged.notify();
            }
        },
        getIsValid: function() {
            return this._isValid;
        },
        setIsValid: function(valid) {
            if(valid != this._isValid){
                this._isValid = valid;
                this.validityChanged.notify();
            }
        },
        getCardType: function() {
            return this._cardType;
        },
        setCardType: function(cardType) {
            if(cardType != this._cardType){
                this._cardType = cardType;
                this.cardTypeChanged.notify();
            }
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputModel = InputModel;
})(window);