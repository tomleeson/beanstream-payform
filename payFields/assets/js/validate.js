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