
(function(window) {
    'use strict';

    function AjaxHelper() {
    }

    AjaxHelper.prototype = {

        makePayment: function(auth, data, listenter) {
            var self = this;
            self._listener = listenter;

            var url = "https://www.beanstream.com/api/v1/payments";

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
            	console.log(xhttp.responseText);
                  self._listener(xhttp.responseText);
                }
            }.bind(self);

            xhttp.open("POST", url, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("Authorization", auth);
            xhttp.send(JSON.stringify(data));
        },

        getToken: function(data, listenter) {
        	console.log("getToken");
            var self = this;
            self._listener = listenter;

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                    console.log(xhttp.responseText);
                    self._listener(xhttp.responseText);
                }
            }.bind(self);

        	var url = "https://www.beanstream.com/scripts/tokenization/tokens?";
        	var querystring = self.encodeQueryData(data);
        	xhttp.open('url', url+querystring);
        	xhttp.send();
        	//console.log("url+querystring: "+url+querystring);
        },
        encodeQueryData: function(data){
		   var ret = [];
		   for (var d in data)
		      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
		   return ret.join("&");
		}

    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.AjaxHelper = AjaxHelper;
})(window);

/*
{
  "number": "string",
  "expiry_month": "string",
  "expiry_year": "string",
  "cvd": "string"
}
*/