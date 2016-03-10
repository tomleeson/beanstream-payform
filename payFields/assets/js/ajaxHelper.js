function AjaxHelper() {

}

AjaxHelper.prototype = subclassOf(Observable);

AjaxHelper.prototype.makePayment = function(data, auth) {
	var that = this;

	var url = "https://www.beanstream.com/api/v1/payments";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
	      that.publish(xhttp.responseText);
	    }
	}.bind(that);

	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.setRequestHeader("Authorization", auth);
	xhttp.send(JSON.stringify(data));
}

