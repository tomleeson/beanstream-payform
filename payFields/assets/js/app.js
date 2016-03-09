(function(){

	function _cacheDom(e) {
		// http://stackoverflow.com/a/22745553
	    // there may be multiple forms in a page, get ref to current form
	    var scripts = document.getElementsByTagName( 'script' );
		this.script = scripts[ scripts.length - 1 ];
		this.form = this.script.parentNode;
		this.head = document.getElementsByTagName("head")[0];
		
		if(this.custom){
			this.cardNumber = this.form.getElementsById('beanstream_cc_number');
			this.cardCvv = this.form.getElementsById('beanstream_cc_expiry');
			this.cardExpiry = this.form.getElementsById('beanstream_cc_cvv');
		}
	}

	function _readAttributes() {
		this.custom = this.script.getAttribute('data-custom');
	}

	function _attachListeners() {

		window.onload = function(event) {

			this.submitBtn = this.form.querySelectorAll("input[type=submit]")[0];

			if (typeof this.submitBtn!="undefined"){

				// validate and get token before submit event
		        this.submitBtn.addEventListener('click', function(event) {
		        	event.preventDefault();
		        	this.submitBtn.disabled = true;
		        	
		        	// toDo: add field validation
		        	// toDo: add getToken

		        	console.log("submit");

		        	//this.form.submit();
		        	this.submitBtn.disabled = false;
				}.bind(this));
		    }

		    var number_frag = document.getElementById("trnCardNumber");
		    var exp_frag = document.getElementById("trnExpMonth");

		};
	}

	function _injectRawHtml() {

		cardNumber.injectRawHtml(this.form);
		cardExpiry.injectRawHtml(this.form);
		cardCvv.injectRawHtml(this.form);
	}

	function _injectStyles(filename){

	    var fileref=document.createElement("link")
	    fileref.setAttribute("rel", "stylesheet")
	    fileref.setAttribute("type", "text/css")
	    fileref.setAttribute("href", filename)

	    if (typeof fileref!="undefined"){
	        this.head.appendChild(fileref);
	    }
	}

	function _injectStyledHtml() {

		cardNumber.injectStyledHtml(this.form);
		cardExpiry.injectStyledHtml(this.form);
		cardCvv.injectStyledHtml(this.form);
	}

	function _init() {
		_cacheDom();
		_readAttributes();
		// todo: replace with to absolute link
		_injectStyles("../assets/css/style.css");

		if(this.custom){
			_injectRawHtml();
		} else {
			_injectStyledHtml();
		}

		_attachListeners();
	}
	_init();

})();




