var helper = (function(){
	function isNonInputKey(event) {

		if(event.shiftKey || event.ctrlKey || event.shiftKey || event.metaKey
		    || event.keyCode === 8 //backspace
		    || event.keyCode === 9 //tab
		    || event.keyCode === 13 //enter
		    || event.keyCode === 37 //left arrow
		    || event.keyCode === 39 //right arrow
		    || event.keyCode === 45 //insert
		    || event.keyCode === 46 //delete
		    ){
		    return true;
		}
		return false;
	}

	function deleteSelectedText(e) {

		e.target.value = e.target.value.replace(e.target.value.substring(e.target.selectionStart,e.target.selectionEnd),"");
	}

	function createDocFrag(htmlStr) {
		// http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
	    var frag = document.createDocumentFragment(),
	        temp = document.createElement('div');
	    temp.innerHTML = htmlStr;
	    while (temp.firstChild) {
	        frag.appendChild(temp.firstChild);
	    }
	    return frag;
	}

	return{
		isNonInputKey: isNonInputKey,
		deleteSelectedText: deleteSelectedText,
		createDocFrag: createDocFrag
	}
})();
var validate = (function(){

	var defaultFormat = /(\d{1,4})/g;

	var cards = [
	    {
	      type: 'visaelectron',
	      patterns: [4026, 417500, 4405, 4508, 4844, 4913, 4917],
	      format: defaultFormat,
	      length: [16],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'maestro',
	      patterns: [5018, 502, 503, 56, 58, 639, 6220, 67],
	      format: defaultFormat,
	      length: [12, 13, 14, 15, 16, 17, 18, 19],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'visa',
	      patterns: [4],
	      format: defaultFormat,
	      length: [13, 16],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'mastercard',
	      patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
	      format: defaultFormat,
	      length: [16],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'amex',
	      patterns: [34, 37],
	      format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
	      length: [15],
	      cvcLength: [3, 4],
	      luhn: true
	    }, {
	      type: 'dinersclub',
	      patterns: [30, 36, 38, 39],
	      format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
	      length: [14],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'discover',
	      patterns: [60, 64, 65, 622],
	      format: defaultFormat,
	      length: [16],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'jcb',
	      patterns: [35],
	      format: defaultFormat,
	      length: [16],
	      cvcLength: [3],
	      luhn: true
	    }
  	];


    function getCardType(number, card) {

        for (var i = 0; i < cards.length; i++) {
        	var patterns = cards[i].patterns;
        	for (var j = 0; j < patterns.length; j++) {
	        	if (number.toString().substring(0, patterns[j].length) === patterns[j].toString()) {
				    return cards[i].type;
				}
			}
        }     
    };


	function getLuhnChecksum(num_str) {
      var digit;
      var sum = 0;
      var num_array = num_str.split('').reverse();
      for (var i = 0; i < num_array.length; i++) {
        digit = num_array[i];
        digit = +digit;
        if (i % 2) {
          digit *= 2;
          if (digit < 10) {
            sum += digit;
          } else {
            sum += digit - 9;
          }
        } else {
          sum += digit;
        }
      }
      return sum % 10 === 0;
    };

	function formatCardNumber_onKeydown(str, newChar) {

        var unformattedStr = str.replace(/\s+/g, '');
        
        if ((unformattedStr.length != 0) && (unformattedStr.length % 4 == 0)) {
              str += ' ';
            }

        return str += newChar;;
    };
    
    function formatCardNumber_onPaste(str) {

        str = str.replace(/\s+/g, '');
        var formattedStr = '';

        for (var i = 0; i < str.length; i++) {
            // Add a space after every 4 characters.
            if ((i != 0) && (i % 4 == 0)) {
              formattedStr += ' ';
            }
            formattedStr += str[i];
        }

        return formattedStr;
    };

    function formatExpiry(str, newChar) {

    	str += newChar;
	    var mon, parts, sep, year;
	    parts = str.match(/^\D*(\d{1,2})(\D+)?(\d{1,4})?/);
	    if (!parts) {
	      return '';
	    }
	    mon = parts[1] || '';
	    sep = parts[2] || '';
	    year = parts[3] || '';
	    if (year.length > 0) {
	      sep = ' / ';
	    } else if (sep === ' /') {
	      mon = mon.substring(0, 1);
	      sep = '';
	    } else if (mon.length === 2 || sep.length > 0) {
	      sep = ' / ';
	    } else if (mon.length === 1 && (mon !== '0' && mon !== '1')) {
	      mon = "0" + mon;
	      sep = ' / ';
	    }
	    return mon + sep + year;
  	};


	return{
		getCardType: getCardType,
		getLuhnChecksum: getLuhnChecksum,
		formatCardNumber_onKeydown: formatCardNumber_onKeydown,
		formatCardNumber_onPaste: formatCardNumber_onPaste,
		formatExpiry: formatExpiry
	}

})();



/*
  $.payment.fn.formatCardNumber = function() {
    this.on('keypress', restrictNumeric);
    this.on('keypress', restrictCardNumber);
    this.on('keypress', formatCardNumber);
    this.on('keydown', formatBackCardNumber);
    this.on('keyup', setCardType);
    this.on('paste', reFormatCardNumber);
    this.on('change', reFormatCardNumber);
    this.on('input', reFormatCardNumber);
    this.on('input', setCardType);
    return this;
  };

    $.payment.validateCardNumber = function(num) {
    var card, _ref;
    num = (num + '').replace(/\s+|-/g, '');
    if (!/^\d+$/.test(num)) {
      return false;
    }
    card = cardFromNumber(num);
    if (!card) {
      return false;
    }
    return (_ref = num.length, __indexOf.call(card.length, _ref) >= 0) && (card.luhn === false || luhnCheck(num));
  };

  */
var cardCvv = (function(){
	var html = {};
	html.input = '<input class="w3-input" type="tel" id="trnCardCvd" name="cvv" autocomplete="off" required>';
	html.label = '<label for="trnCardCvd">CVV</label>';

	function _cacheDom() {
		this.input = document.getElementById("trnCardCvd");
	}

	function injectRawHtml(ele) {
		var frag = helper.createDocFrag(this.html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function injectStyledHtml(ele) {
		var frag =  helper.createDocFrag(html.label + html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function _attachListeners() {
		if (typeof this.input!="undefined"){
		    this.input.addEventListener('keydown', _onKeydown, false);
			this.input.addEventListener('paste', _onPaste, false);
		}
	}

	function _onKeydown(e) {
		if(helper.isNonInputKey(e)){
		    return;
		}
		
		helper.deleteSelectedText(e);
		var newChar = String.fromCharCode(e.keyCode);

		if(input.value.length >= 3 || isNaN(newChar)){
			e.preventDefault();
		}
		
		return false;
	}

	function _onPaste(e) {
		e.preventDefault();
		helper.deleteSelectedText(e);

		if (e && e.clipboardData && e.clipboardData.getData) {
			if (/text\/plain/.test(e.clipboardData.types)) {

				var data = e.clipboardData.getData('text/plain');
				var data = data.replace( /^\D+/g, ''); // remove non-numeric data
				var str = input.value + data;
				input.value = validate.formatCvv(str);
			}
		}
	}

	return{
		injectRawHtml: injectRawHtml,
		injectStyledHtml: injectStyledHtml
	}
})();
var cardExpiry = (function(){
	var html = {};
	html.input = '<input class="w3-input" type="tel" id="trnExpMonth" name="cc-exp" autocomplete="cc-exp" required>';
	html.label = '<label for="trnExpMonth">Expiry</label>';


	function _cacheDom() {
		this.input = document.getElementById("trnExpMonth");
	}

	function injectRawHtml(ele) {

		var frag = helper.createDocFrag(this.html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function injectStyledHtml(ele) {

		var frag =  helper.createDocFrag(html.label + html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function _attachListeners() {
		if (typeof this.input!="undefined"){
		    this.input.addEventListener('keydown', _onKeydown, false);
			this.input.addEventListener('paste', _onPaste, false);
		}
	}

	function _onKeydown(e) {
		if(helper.isNonInputKey(e)){
		    return;
		 }
		e.preventDefault();
		helper.deleteSelectedText(e);

		var newChar = String.fromCharCode(e.keyCode);

		if (!isNaN(newChar)){
			e.target.value = validate.formatExpiry(e.target.value, newChar);
		}
		return false;
	}

	function _onPaste(e) {
		e.preventDefault();
		helper.deleteSelectedText(e);

		if (e && e.clipboardData && e.clipboardData.getData) {
			if (/text\/plain/.test(e.clipboardData.types)) {

				var data = e.clipboardData.getData('text/plain');
				var data = data.replace( /^\D+/g, ''); // remove non-numeric data
				var str = input.value + data;
				e.target.value = validate.formatExpiry(str, '');
			}
		}
	}

	return{
		injectRawHtml: injectRawHtml,
		injectStyledHtml: injectStyledHtml
	}
})();
var cardNumber = (function(){
	var html = {};
	html.input = '<input class="w3-input" type="tel" id="trnCardNumber" name="cardnumber" autocomplete="cc-number" required>';
	html.label = '<label for="trnCardNumber">Card Number</label>';


	function _cacheDom() {
		this.input = document.getElementById("trnCardNumber");
	}

	function injectRawHtml(ele) {
		var frag = helper.createDocFrag(this.html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function injectStyledHtml(ele) {
		var frag =  helper.createDocFrag(html.label + html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function _attachListeners() {
		if (typeof this.input!="undefined"){
		    this.input.addEventListener('keydown', _onKeydown, false);
			this.input.addEventListener('paste', _onPaste, false);
		}
	}

	function _onKeydown(e) {
		if(helper.isNonInputKey(e)){
		    return;
		 }
		e.preventDefault();
		helper.deleteSelectedText(e);

		var newChar = String.fromCharCode(e.keyCode);

		if (!isNaN(newChar)){
			e.target.value = validate.formatCardNumber_onKeydown(e.target.value, newChar);
		}
		return false;
	}

	function _onPaste(e) {
		e.preventDefault();
		helper.deleteSelectedText(e);

		if (e && e.clipboardData && e.clipboardData.getData) {
			if (/text\/plain/.test(e.clipboardData.types)) {

				var data = e.clipboardData.getData('text/plain');
				var data = data.replace( /^\D+/g, ''); // remove non-numeric data
				var str = e.target.value + data;
				e.target.value = validate.formatCardNumber_onPaste(str);
			}
		}
	}

	return{
		injectRawHtml: injectRawHtml,
		injectStyledHtml: injectStyledHtml
	}
})();
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




