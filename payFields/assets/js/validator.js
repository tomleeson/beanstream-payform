
(function(window) {
    'use strict';

    var Validator = (function() {

        var defaultFormat = /(\d{1,4})/g;

        var cards = [{
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
        }];

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

        function formatCardNumber(str) {

            str = str.replace(/\s+/g, '');
            var formattedStr = '';

            for (var i = 0; i < str.length; i++) {
                // Add a space after every 4 characters.
                if ((i != 0) && (i % 4 == 0)) {
                    formattedStr += ' ';
                }
                formattedStr += str[i];
            }

            var cardType = getCardType(formattedStr);
            formattedStr = limitLength(formattedStr, "length", cardType);

            return formattedStr;
        };

        function formatExpiry(str) {

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

        function limitLength(str, fieldType, cardType) {

            if((fieldType != "length" && fieldType != "cvcLength") || cardType === undefined || cardType === ""){
                return str; 
            }

            var card = cards.filter(function( c ) {
              return c.type === cardType;
            });
            card = card[0];
                      
            var lengths = card[fieldType]
            var max = Math.max.apply( Math, lengths );

            // adjust for whitespacing in creditcard str
            var whiteSpacing = (str.match(new RegExp(" ", "g")) || []).length;

            // trim() is needed to remove final white space
            str = str.substring(0, max+whiteSpacing).trim();

            return str; 
        };


        function getCardType(str) {
            var cardType = "";

            loop1:
            for(var i=0; i<cards.length; i++){
                var patterns = cards[i].patterns;               
                loop2:
                for(var j=0; j<patterns.length; j++){
                    var pos = str.indexOf(patterns[j]);
                    if(pos === 0){
                       cardType = cards[i].type;
                       break loop1;
                    }
                }
            }
            return cardType; 
        };




        return {
            getCardType: getCardType,
            getLuhnChecksum: getLuhnChecksum,
            formatCardNumber: formatCardNumber,
            formatExpiry: formatExpiry,
            limitLength: limitLength
        }

    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Validator = Validator;
})(window);