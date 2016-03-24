
(function (window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function FormModel() {
        this._token = "";

        this._fields = {
            cc_number: {
                name: "cardnumber",
                labelText: "Credit Card Number",
                placeholder: "",
                autocomplete: "cc-number"
            },
            cc_cvv: {
                name: "cvc",
                labelText: "CVC",
                placeholder: "",
                autocomplete: "cc-csc"
            },
            cc_exp: {
                name: "cc-exp",
                labelText: "Expires MM/YY",
                placeholder: "",
                autocomplete: "cc-exp"
            }
        };

        this._domTargetsFound = {inputs: false, errors: false};


        this.tokenChanged = new beanstream.Event(this);
        this.domTargetsFoundChanged = new beanstream.Event(this);
        
    }

    FormModel.prototype = {
        getToken: function () {
            return this._token;
        },
        setToken: function (token) {
            if (token !== this._token) {
                this._token = token;
                this.tokenChanged.notify();
            }
        },
        getFields: function () {
            return this._fields;
        },
        getDomTargetsFound: function (key) {
            return this._domTargetsFound[key];
        },
        setDomTargetsFound: function (key, value) {
            if (value !== this._domTargetsFound[key]) {
                this._domTargetsFound[key] = value;
                this.domTargetsFoundChanged.notify();
            }
        },
        getSubmitForm: function () {
            return this._submitForm;
        },
        setSubmitForm: function (value) {
            this._submitForm = value;
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormModel = FormModel;
})(window);