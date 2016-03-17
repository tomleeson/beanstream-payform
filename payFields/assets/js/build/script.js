
(function(window) {
    'use strict';

    var Helper = (function() {
        function isNonInputKey(event) {

            if (event.shiftKey || event.ctrlKey || event.shiftKey || event.metaKey 
                || event.keyCode === 8 //backspace
                || event.keyCode === 9 //tab
                || event.keyCode === 13 //enter
                || event.keyCode === 37 //left arrow
                || event.keyCode === 39 //right arrow
                || event.keyCode === 45 //insert
                || event.keyCode === 46 //delete
            ) {
                return true;
            }
            return false;
        }

        function deleteSelectedText(e) {

            e.target.value = e.target.value.replace(e.target.value.substring(e.target.selectionStart, e.target.selectionEnd), "");
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

        function isEmpty(obj) {

            // http://stackoverflow.com/a/4994244/6011159
            if (obj == null) return true;
            if (obj.length > 0) return false;
            if (obj.length === 0) return true;

            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        return {
            isNonInputKey: isNonInputKey,
            deleteSelectedText: deleteSelectedText,
            createDocFrag: createDocFrag,
            isEmpty: isEmpty
        }

    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Helper = Helper;
})(window);

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

            num_str = num_str.replace(/\s+/g, '');
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
            var cardType = getCardType(str);

            var card = cards.filter(function( c ) {
              return c.type === cardType;
            });

            card = card[0];

            if(card){
                var format = card["format"]
                
                if (format.global) {
                    var arr = str.match(format).join(' ');
                    str = limitLength(arr, "length", cardType);                    
                } 
                else{
                    var arr = format.exec(str);
                    arr.shift(); // remove first element which contains the full matched text 
                    str = arr.join(' ');
                }
            } 

            return str;
        };

        function formatExpiry(str) {

            var mon, parts, sep, year;
            parts = str.match(/^\D*(\d{1,2})(\D+)?(\d{1,2})?/);
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

            var max = getMaxLength(fieldType, cardType);

            // adjust for whitespacing in creditcard str
            var whiteSpacing = (str.match(new RegExp(" ", "g")) || []).length;

            // trim() is needed to remove final white space
            str = str.substring(0, max+whiteSpacing).trim();

            return str; 
        };

        function getMaxLength(fieldType, cardType){
            
            var card = cards.filter(function( c ) {
              return c.type === cardType;
            });
            card = card[0];

            var lengths = card[fieldType]
            var max = Math.max.apply( Math, lengths );
            return max;
        };

        function isValidExpiryDate(str, currentDate, onBlur) {

            if(onBlur && str === ""){
                 return {isValid: false, error: "This is a required field."}; // Validate onBlur as required field
            }

            // expects str in format "mm/yyyy"
            var arr = str.split("/");
            //JavaScript counts months from 0 to 11
            var month = arr[0];
            if(month) month = month.trim() -1;
            var year = arr[1];
            if(year){
                year = year.trim();
                if(year.length === 2){
                    year = "20" + year; 

                    var expiryDate = new Date(year, month);
                    if (expiryDate < currentDate) {
                        return {isValid: false, error: "This date is past. Your card has expired."};
                    }
                } else if(onBlur){
                    return {isValid: false, error: "This is a required field."}; // Validate onBlur as required field
                }
            }  
            if(onBlur){
                if(year){
                    year = year.trim();
                    year = "20" + year; 
                } else {
                    year = 0;
                }
                
                var expiryDate = new Date(year, month);

                if (expiryDate < currentDate) {
                    return {isValid: false, error: "This date is past. Your card has expired."};
                }
            } 
 
            return {isValid: true, error: ""};
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

        function isValidCardNumber(str, onBlur) {

            str = str.replace(/\s+/g, '');
            var cardType = "";
            var max = 0;

            if(str.length > 0){
                cardType = getCardType(str);
                if(cardType){
                    max = getMaxLength("length", cardType);
                }
            }
            
            if(onBlur){
                if(str.length === 0 || cardType === "") {
                    return {isValid: false, error: "This is a required field."}; // Validate onBlur as required field
                } else if(str.length != max){
                    return {isValid: false, error: "This card numer is too short."}; // if onBlur and str not complete
                } else{
                    var luhn = getLuhnChecksum(str);
                    if(luhn){
                        return {isValid: true, error: ""};
                    } else{
                        return {isValid: false, error: "This is an invalid card number."};
                    }
                }

            } else{
                if(str.length === max){
                    var luhn = getLuhnChecksum(str);
                    if(luhn){
                        return {isValid: true, error: ""};
                    } else{
                        return {isValid: false, error: "This is an invalid card number."};
                    }
                }

            }
            
            return {isValid: true, error: ""}; // Report valid while user is inputting str
        };

        function isValidCvc(cardType, str, onBlur) {


            if(onBlur && str.length === 0){
                return {isValid: false, error: "This is a required field."};
            }
            if(cardType === ""){
                return {isValid: true, error: ""}; // Unknown card type. Default to true
            }
            
            var max = getMaxLength("cvcLength", cardType);
            if(str.length < max && onBlur === true){
                return {isValid: false, error: "This card numer is too short."};
            }

            return {isValid: true, error: ""};
        };


        return {
            getCardType: getCardType,
            getLuhnChecksum: getLuhnChecksum,
            formatCardNumber: formatCardNumber,
            formatExpiry: formatExpiry,
            limitLength: limitLength,
            isValidExpiryDate: isValidExpiryDate,
            isValidCardNumber: isValidCardNumber,
            isValidCvc: isValidCvc,
            getMaxLength: getMaxLength
        }

    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Validator = Validator;
})(window);

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
            
            var url = "https://www.beanstream.com/scripts/tokenization/tokens";
            data = JSON.stringify(data);

            if (window.XMLHttpRequest) {
	            var xhttp = new XMLHttpRequest();
	            xhttp.onreadystatechange = function() {
	            if (xhttp.readyState == 4 && xhttp.status == 200) {
	                    self._listener(self.parseResponse(xhttp.responseText));
	                }
	            }.bind(self);

	        	xhttp.open("POST", url, true);
	            xhttp.send(data);
        	} else if(window.XDomainRequest){
        		//https required for POST CORS requests in XDomainRequest
        		//XDomainRequest required to support  IE 8 and 9
        		//https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
        		//https required for POST CORS requests in XDomainRequest

        		if(window.location.protocol == "https:"){
	        		var xdr = new XDomainRequest();
	        		xdr.open("get", url);

	        		xdr.onload = function() {
						self._listener(self.parseResponse(xdr.responseText));
					}

					setTimeout(function () {
					    xdr.send(data);
					}, 0);
				} else{
					var response = new self.formattedResponse();
					response.code = 5;
					response.message = "HTTPS connection required in Internet Explorer 9 and below";
					self._listener(response);
				}
        	} else {
	            var response = new self.formattedResponse();
				response.code = 6;
				response.message = "Unsupported browser";
				self._listener(response);
	        }

        },
		formattedResponse: function() {
			var self = this;
			self.code = "";
		    self.message = "";
		    self.token = "";
		    self.success = false;
		},
		parseResponse: function(obj) {
			var self = this;
		    obj = JSON.parse(obj);
		    var response = new self.formattedResponse();
		    if (obj.code == 1) {
		        response.success = true;
		        response.token = obj.token;
		    } else {
		        response.message = obj.message;
		    }
		    return response;
		}


    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.AjaxHelper = AjaxHelper;
})(window);



(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = "";
        this._isValid = true;
        this._cardType = "";
        this._fieldType = "";
        this._error = "";

        this.valueChanged = new beanstream.Event(this);
        this.validityChanged = new beanstream.Event(this);
        this.cardTypeChanged = new beanstream.Event(this);
    }

    InputModel.prototype = {

        getValue: function() {
            return this._value;
        },
        setValue: function(value) {
            if(value != this._value){
                this._value = value;
                this.valueChanged.notify();
            }
        },
        getIsValid: function() {
            return this._isValid;
        },
        setIsValid: function(valid) {
            if(valid != this._isValid){
                this._isValid = valid;
                this.validityChanged.notify();
            }
        },
        getCardType: function() {
            return this._cardType;
        },
        setCardType: function(cardType) {
            if(cardType != this._cardType){
                this._cardType = cardType;
                this.cardTypeChanged.notify();
            }
        },
        getFieldType: function() {
            return this._fieldType;
        },
        setFieType: function(fieldType) {
            this._fieldType = fieldType;
        },
        getError: function() {
            return this._error;
        },
        setError: function(error) {
            this._error = error;
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputModel = InputModel;
})(window);

(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function InputView(model, template, domParentElements) {
        this._model = model;
        this._template = template;
        this._domParentElements = domParentElements;

        //this._domParentElement = domParentElements;
        if (domParentElements.form) {
            this._domParentElement = domParentElements.form;
        }

        this.keydown = new beanstream.Event(this);
        this.keyup = new beanstream.Event(this);
        this.paste = new beanstream.Event(this);
        this.blur = new beanstream.Event(this);

        var _this = this;

        // attach model Listeners
        this._model.valueChanged.attach(function() {
            _this.render("value", "");
        });
        this._model.cardTypeChanged.attach(function() {
            _this.render("cardType", "");
        });
        this._model.validityChanged.attach(function() {
            _this.render("isValid", "");
        });

    }

    InputView.prototype = {

        render: function(viewCmd, parameter) {
            var _this = this;
            var viewCommands = {
                elements: function() {
                    var template = _this._template.show(parameter);
                    var inputFrag = _this.createDocFrag(template.input);
                    var labelFrag = _this.createDocFrag(template.label);
                    var errorFrag = _this.createDocFrag(template.error);

                    if (parameter.domTargetsFound_input) {
                        // If a dom target is found do not append label
                        _this._domParentElements.input.appendChild(inputFrag);
                    } else {
                        _this._domParentElements.form.appendChild(labelFrag);
                        _this._domParentElements.form.appendChild(inputFrag);                       
                    }

                    if(parameter.domTargetsFound_error){
                        _this._domParentElements.error.appendChild(errorFrag);
                    } else if (!parameter.domTargetsFound_error && parameter.domTargetsFound_input) {
                        _this._domParentElements.input.appendChild(errorFrag);
                    } else {
                        _this._domParentElements.form.appendChild(errorFrag);
                    }
                    _this.cacheDom(parameter.id);

                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domInputElement.value = _this._model.getValue();
                },
                cardType: function() {
                    var fieldType = _this._model.getFieldType();
                    if(fieldType == "cc-number"){
                        var cardType = _this._model.getCardType();

                        if(cardType){
                            if(cardType === "maestro") cardType = "mastercard";
                            if(cardType === "visaelectron")  cardType = "visa";
                            _this._domInputElement.style.backgroundImage = 'url(../assets/css/images/' + cardType + '.png)';
                        } else{
                            _this._domInputElement.style.backgroundImage = "none";
                        }
                    }
                },
                isValid: function() {
                    var isValid = _this._model.getIsValid();
                    if(isValid){
                        _this._domInputElement.className = _this._domInputElement.className.replace(" beanstream_invalid", "");
                    } else{
                        _this._domInputElement.className += " beanstream_invalid";
                    }
                    _this._domErrorElement.innerHTML = _this._model.getError();
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {

            this._domInputElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + ']');
            this._domErrorElement = this._domParentElements.form.querySelector('[data-beanstream-id="' + id + '_error"]');
        },
        attachDomListeners: function() {
            var _this = this;

            this._domInputElement.addEventListener('keydown', function(e) {
                _this.keydown.notify(e);
            }, false);
            this._domInputElement.addEventListener('keyup', function(e) {
                var args = {event: e, inputValue: _this._domInputElement.value};
                _this.keyup.notify(args);
            }, false);
            this._domInputElement.addEventListener('paste', function(e) {
                _this.paste.notify(e);
            }, false);
            this._domInputElement.addEventListener('blur', function(e) {
                _this.blur.notify(e);
            }, false);
        },
        createDocFrag: function(htmlStr) {
            // http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
            var frag = document.createDocumentFragment(),
                temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputView = InputView;
})(window);

(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function InputController(model, view, config) {

        var self = this;
        self._model = model;
        self._view = view;
        self._config = config;

        self._model.setFieType(self._config.autocomplete);

        self.cardTypeChanged = new beanstream.Event(this);
        self.inputComplete = new beanstream.Event(this);
        self.inputValidityChanged = new beanstream.Event(this);

        //notifier for view 
        self._view.render("elements", self._config);

        //listen to view events
        self._view.keydown.attach(function(sender, e) {
            if(beanstream.Helper.isNonInputKey(e)){
                // Don't override default functionality except for input
                return;
            }
            e.preventDefault();

            var char = String.fromCharCode(e.keyCode);

            var selectedText = {};
            selectedText.start = e.target.selectionStart;
            selectedText.end = e.target.selectionEnd;

            self.limitInput(char, selectedText);
        });

        self._view.keyup.attach(function(sender, args) {
            if(args.event.keyCode === 8 || args.event.keyCode === 46){
                //Update model directly from UI on delete
                //keyup is only needed for deletion
                self._model.setValue(args.inputValue);
                
                if(self._model.getFieldType() === "cc-number"){
                    var cardType = beanstream.Validator.getCardType(args.inputValue);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.isValidCardNumber(args.inputValue);
                    self.setInputValidity(isValid);
                }
                if(self._model.getFieldType() === "cc-exp"){
                    var isValid = beanstream.Validator.isValidExpiryDate(args.inputValue, new Date());
                    self.setInputValidity(isValid);
                }

                if(self._model.getFieldType() === "cc-csc"){
                    var cardType = self._model.getCardType();
                    var isValid = beanstream.Validator.isValidCvc(cardType, args.inputValue);
                    self.setInputValidity(isValid);
                }


            }
        });

        self._view.paste.attach(function(sender, e) {
            e.preventDefault();

            var pastedStr = e.clipboardData.getData('text/plain');

            var selectedText = {};
            selectedText.start = e.target.selectionStart;
            selectedText.end = e.target.selectionEnd;

            self.limitInput(pastedStr, selectedText);
        });

        self._view.blur.attach(function(sender, e) {
            var onBlur = true;
            var str = self._model.getValue();

            switch(self._model.getFieldType()) {
                case "cc-number":
                    var isValid = beanstream.Validator.isValidCardNumber(str, onBlur);
                    self.setInputValidity(isValid);
                    break;
                case "cc-csc":
                    var cardType = self._model.getCardType();
                    var isValid = beanstream.Validator.isValidCvc(cardType, str, onBlur);
                    self.setInputValidity(isValid);
                    break;
                case "cc-exp":
                    var isValid = beanstream.Validator.isValidExpiryDate(str, new Date(), onBlur);
                    self.setInputValidity(isValid);
                    break;
                default:
                    break;
            }

        });
    }

    InputController.prototype = {

        limitInput: function(str, selectedText) {
            var self = this;

            str = str.replace(/\D/g,''); // remove non ints from string

            if(!str.length){
                return;
            }

            // Remove any text selected in ui
            var currentStr = self._model.getValue();
            currentStr =  currentStr.replace(
                            currentStr.substring(
                                selectedText.start, selectedText.end), "");

            var newStr = currentStr + str;

            switch(self._model.getFieldType()) {
                case "cc-number":
                    newStr = beanstream.Validator.formatCardNumber(newStr);
                    var cardType = beanstream.Validator.getCardType(newStr);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.isValidCardNumber(newStr);
                    self.setInputValidity(isValid);
                    break;
                case "cc-csc":
                    var cardType = self._model.getCardType();
                    newStr = beanstream.Validator.limitLength(newStr, "cvcLength", self._model.getCardType());
                    var isValid = beanstream.Validator.isValidCvc(cardType, newStr);
                    self.setInputValidity(isValid);
                    break;
                case "cc-exp":
                    newStr = beanstream.Validator.formatExpiry(newStr);
                    var isValid = beanstream.Validator.isValidExpiryDate(newStr, new Date());
                    self.setInputValidity(isValid);
                    break;
                default:
                    break;
            }
            
            self._model.setValue(newStr);
            
            if(self._model.getIsValid()){
                var cardType = self._model.getCardType();
                if(cardType != "" || self._model.getFieldType() === "cc-exp" ){
                    self.updateFocus(newStr, self._model.getCardType());
                }
            }   
        },

        setCardType: function(cardType) {
            var self = this;  
            var currentType = self._model.setCardType(cardType);   
            if(cardType != currentType ){   
                self._model.setCardType(cardType); // update model for viey
                self.cardTypeChanged.notify(cardType); //emit event for form
            }
        },

        setInputValidity: function(args) {
            var self = this;     
            self._model.setError(args.error); 
            self._model.setIsValid(args.isValid);
            self.inputValidityChanged.notify(args);
        },

        updateFocus: function(str, cardType) {
            var self = this;
            var max;
            str = str.replace(/\s+/g, ''); //remove white spaces from string
            var len = str.length;

            switch(self._model.getFieldType()) {
                case "cc-number":
                    max = beanstream.Validator.getMaxLength("length", cardType);
                    break;
                case "cc-csc":
                    max = beanstream.Validator.getMaxLength("cvcLength", cardType);
                    break;
                case "cc-exp":
                    max = 5; //Format: "MM / YY", minus white spacing
                    break;
                default:
                    break;
            }

            if(max === len){
                self.inputComplete.notify();
            }

        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);

(function(window) {
    'use strict';

    function InputTemplate() {
        this.inputTemplate = '<input data-beanstream-id="{{id}}" placeholder="{{placeholder}}" autocomplete="{{autocomplete}}"></input>';

        this.labelTemplate = '<label data-beanstream-id="" for="{{id}}">{{labelText}}</label>';

        this.errorTemplate = '<div data-beanstream-id="{{id}}_error"></div>';
    }

    InputTemplate.prototype.show = function(parameter) {

        var template = {};
        template.label = this.labelTemplate;
        template.input = this.inputTemplate;
        template.error = this.errorTemplate;

        template.label = template.label.replace('{{id}}', parameter.id);
        template.label = template.label.replace('{{labelText}}', parameter.labelText);
        template.input = template.input.replace(/{{id}}/gi, parameter.id);
        template.input = template.input.replace('{{placeholder}}', parameter.placeholder);
        template.input = template.input.replace('{{autocomplete}}', parameter.autocomplete);
        template.error = template.error.replace('{{id}}', parameter.id);

        return template;
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputTemplate = InputTemplate;
})(window);
(function (window) {
    'use strict';

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach: function (Inputener) {
        this._listeners.push(Inputener);
    },
    notify: function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Event = Event;
})(window);

(function() {

    // ToDo: Refactor App logic along MVC pattern for clarity and testibility

    var fields = {
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


    function cacheDom() {
        // http://stackoverflow.com/a/22745553
        // there may be multiple forms in a page, get ref to current form
        var scripts = document.getElementsByTagName('script');
        this.script = scripts[scripts.length - 1];
        this.form = this.script.parentNode;
        this.head = document.getElementsByTagName("head")[0];
        this.domTargets = {};

        this.config.domTargetsFound_input = true;
        this.config.domTargetsFound_error = true;

        for (field in fields) {

            var input = field + "_input";
            var error = field + "_error";
            
            this.domTargets[input] 
                = this.form.querySelector('[data-beanstream-target="'+input+'"]');

            this.domTargets[error] 
                = this.form.querySelector('[data-beanstream-target="'+error+'"]');

            // Set flags. If target missing for any input, ignore all input targets
            if(this.domTargets[input] === null){
                this.config.domTargetsFound_input = false;
            }
            if(this.domTargets[error] === null){
                this.config.domTargetsFound_error = false;
            }
        }

    }

    function attachDomListeners() {
        window.onload = function(event) {
            // validate and get token before submit event
            // button is below script tag, so we wait until it loads
            this.submitBtn = this.form.querySelector("input[type=submit]");
            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelector("button[type=submit]");
            }

            this.submitBtn.addEventListener("click", onSubmit, false);
        };

    }

    function onSubmit(event) {
        var self = this;

        this.submitBtn = this.form.querySelector("input[type=submit]");
        if (!this.submitBtn) {
            this.submitBtn = this.form.querySelector("button[type=submit]");
        }

        event.preventDefault();
        this.submitBtn.disabled = true;

        var data = getFieldValues();
        if(!beanstream.Helper.isEmpty(data)){

            var ajaxHelper = new beanstream.AjaxHelper();
            ajaxHelper.getToken(data, function(args) {
                
                appendToken(self.form, args.token);

                if(this.submitForm){
                    this.form.submit();
                } else{
                    fireEvent('beanstream_tokenUpdated');
                }
            }.bind(self));
        }

        this.submitBtn.disabled = false;
    }

    function appendToken(form, value) {

        var input = form.querySelector("input[name=singleUseToken]");

        if(input){
            input.value = value;
        } else{
            input = document.createElement('input');
            input.type = "hidden";
            input.name = "singleUseToken";
            input.value = value;
            form.appendChild(input);
        }
    }

    function getFieldValues() {

        var data = {};

        var invalidFields = fieldObjs.filter(function( f ) {
              return f.controller._model.getIsValid() === false;
            });

        var emptyFields = fieldObjs.filter(function( f ) {
              return f.controller._model.getValue() === "";
            });

        if(invalidFields.length === 0 && emptyFields.length === 0) {
            for(var i=0; i<fieldObjs.length; i++){

                switch(fieldObjs[i].controller._config.id) {
                    case "cc_number":
                        data.number = fieldObjs[i].controller._model.getValue();
                        break;
                    case "cc_cvv":
                        data.cvd = fieldObjs[i].controller._model.getValue();;
                        break;
                    case "cc_exp":
                        var str = fieldObjs[i].controller._model.getValue();
                        var arr = str.split("/");
                        data.expiry_month = arr[0].trim();
                        data.expiry_year = "20" + arr[1].trim();
                        break;
                    default:
                        break;
                }

                fieldObjs[i].controller._model.setValue("");
            }
        }

        return data;
    }

    function injectStyles(filename) {

        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)

        if (typeof fileref != "undefined") {
            this.head.appendChild(fileref);
        }
    }

    function injectFields(filename) {

        this.fieldObjs = [];

        for (field in fields) {
            var domTargets = {};
            if (this.config.domTargetsFound_input) {
                domTargets.input = this.domTargets[field + "_input"];
            }
            if (this.config.domTargetsFound_error) {
                domTargets.error = this.domTargets[field + "_error"];
            }
            domTargets.form = this.form;

            var config = new Object;
            config.domTargetsFound_input = this.config.domTargetsFound_input;
            config.domTargetsFound_error = this.config.domTargetsFound_error;
            config.id = field;
            config.name = fields[field].name;
            config.labelText = fields[field].labelText;
            config.placeholder = fields[field].placeholder;
            config.autocomplete = fields[field].autocomplete;
            var f = {};
            f.model = new beanstream.InputModel();
            f.template = new beanstream.InputTemplate();
            f.view = new beanstream.InputView(f.model, f.template, domTargets);
            f.controller = new beanstream.InputController(f.model, f.view, config);

            this.fieldObjs.push(f);
        }

        // register listener on controller for cardType changed
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_number";
            });
        field = field[0];

        //attach listeners to new field
        if(field){
            field.controller.cardTypeChanged.attach(function(sender, cardType) {
                setCardType(cardType)
            });
        }

        for (field in this.fieldObjs) {

            this.fieldObjs[field].controller.inputComplete.attach(function(sender) {
                setFocusNext(sender);
            });
            this.fieldObjs[field].controller.inputValidityChanged.attach(function(sender, args) {
                inputValidityChanged(args)
            });
        }

    }

    function setCardType(cardType) {
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_cvv";
            });
        field = field[0];

        if(field){
            field.controller._model.setCardType(cardType);
        }
    }

    function inputValidityChanged(args) {
        fireEvent('beanstream_inputValidityChanged', args);
    }

    function setFocusNext(sender) {

        var currentEl_id = sender._config.id;
        var inputs = form.getElementsByTagName("input");

        var currentInput = getIndexById(inputs, currentEl_id);
        if(inputs[currentInput+1]){
            inputs[currentInput+1].focus();
        } else{
            this.submitBtn.focus();
        }
    }

    function getIndexById(source, id) {
        for (var i = 0; i < source.length; i++) {
            
            if (source[i].getAttribute('data-beanstream-id') === id) {
                return i;
            }
        }
    }

    function fireEvent(title, eventDetail) {
        var event = new CustomEvent(title);
        event.eventDetail = eventDetail;
        document.dispatchEvent(event);
    }

    function readAttributes() {
        this.submitForm = this.script.getAttribute('data-submit-form');

        if(this.submitForm === null || this.submitForm === ""){
            this.submitForm = true;
        }
    }

    function init() {
        this.config = {};

        cacheDom();
        readAttributes();
        attachDomListeners();

        // todo: replace with to absolute link
        injectStyles("../assets/css/style.css");
        injectFields();

        fireEvent('beanstream_loaded');
    }
    init();

})();