
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function FormModel() {
        this._addressSync = true;
        this._billingAddress = {};
        this._shippingAddress = {};
        this._cardInfo = {};
        this._currentPanel = '';
        this._isValid = false;
        this._cardErrors = [];
        this._nonCardErrors = [];
        this._delayProcessing = false;
    }

    FormModel.prototype = {
        getAddressSync: function() {
            return this._addressSync;
        },
        setAddressSync: function(value) {
            if (value != this._addressSync) {
                this._addressSync = value;
            }
        },
        getShippingAddress: function() {
            return this._shippingAddress;
        },
        setShippingAddress: function(value) {
            if (value != this._shippingAddress) {
                this._shippingAddress = value;
            }
        },
        getBillingAddress: function() {
            return this._billingAddress;
        },
        setBillingAddress: function(value) {
            if (value != this._billingAddress) {
                this._billingAddress = value;
            }
        },
        getCardInfo: function() {
            return this._cardInfo;
        },
        setCardInfo: function(value) {
            if (value != this._cardInfo) {
                this._cardInfo = value;
            }
        },
        getCurrentPanel: function() {
            return this._currentPanel;
        },
        setCurrentPanel: function(value) {
            if (value != this._currentPanel) {
                this._currentPanel = value;
            }
        },
        getIsCurrentPanelValid: function() {
            return this._isValid;
        },
        setIsCurrentPanelValid: function(value) {
            if (value != this._isValid) {
                this._isValid = value;
            }
        },
        getNonCardErrors: function() {
            return this._nonCardErrors;
        },
        setNonCardErrors: function(value) {
            this._nonCardErrors = value;
        },
        getCardErrors: function() {
            return this._cardErrors;
        },
        setCardErrors: function(value) {
            // Remove previous error for field
            var cardErrors = this._cardErrors.filter(function(f) {
                return f.fieldType != value.fieldType;
            });

            // only add error message if field invalid
            if (value.isValid != true && cardErrors.indexOf(value) === -1) {
                cardErrors.push(value);
            }
            this._cardErrors = cardErrors;
        },
        getDelayProcessing: function() {
            return this._delayProcessing;
        },
        setDelayProcessing: function(value) {
            if (value != this._delayProcessing) {
                this._delayProcessing = value;
            }
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormModel = FormModel;
})(window);
