
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
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormModel = FormModel;
})(window);
