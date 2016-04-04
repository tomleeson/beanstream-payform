(function(window) {
    'use strict';

    /**
    * Simple object to encapsulate functionality related calling the REST API
    */
    function AjaxHelper() {
    }

    /**
    * Tokenises card data and returns token to callback function passed in
    * @param {Object} data.                 Model Schema: {
    *                                                       number: "String",
    *                                                       cvd: "String",
    *                                                       expiry_month: "String - MM",
    *                                                       expiry_year: "String - YYYY" }
    *
    * @param {Function} listener. Peram1. Model Schema: {
    *                                                       "token": "string",
    *                                                       "code": "string",
    *                                                       "version": 0,
    *                                                       "message": "string" }
    */
    AjaxHelper.prototype = {
        getToken: function(data, listener) {
            console.log('getToken');
            var self = this;
            self._listener = listener;

            var url = 'https://www.beanstream.com/scripts/tokenization/tokens';
            data = JSON.stringify(data);

            if (window.XMLHttpRequest) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState === 4 && xhttp.status === 200) {
                        self._listener(self.parseResponse(xhttp.responseText));
                    }
                }.bind(self);

                xhttp.open('POST', url, true);
                xhttp.send(data);
            } else if (window.XDomainRequest) {

                // https required for POST CORS requests in XDomainRequest
                // XDomainRequest required to support  IE 8 and 9
                // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
                // https required for POST CORS requests in XDomainRequest

                if (window.location.protocol === 'https:') {
                    var xdr = new XDomainRequest();
                    xdr.open('get', url);

                    xdr.onload = function() {
                        self._listener(self.parseResponse(xdr.responseText));
                    };

                    setTimeout(function() {
                        xdr.send(data);
                    }, 0);
                } else {
                    var response = new self.formattedResponse();
                    response.code = 5;
                    response.message = 'HTTPS connection required in Internet Explorer 9 and below';
                    self._listener(response);
                }
            } else {
                var response = new self.formattedResponse();
                response.code = 6;
                response.message = 'Unsupported browser';
                self._listener(response);
            }
        },
        formattedResponse: function() {
            var self = this;
            self.code = '';
            self.message = '';
            self.token = '';
            self.success = false;
        },
        parseResponse: function(obj) {
            var self = this;
            obj = JSON.parse(obj);
            var response = new self.formattedResponse();

            if (obj.code === 1) {
                response.success = true;
                response.token = obj.token;
            }

            response.code = obj.code;
            response.message = obj.message;
            response.token = obj.token;

            return response;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.AjaxHelper = AjaxHelper;
})(window);
