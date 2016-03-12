
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

        return {
            isNonInputKey: isNonInputKey,
            deleteSelectedText: deleteSelectedText,
            createDocFrag: createDocFrag
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

        function isValidExpiryDate(str, currentDate) {

            // expects str in format "mm/yyyy"
            var arr = str.split("/");
            //JavaScript counts months from 0 to 11
            var month = arr[0];
            if(month) month = month.trim() -1;
            var year = arr[1];
            if(year) year = year.trim();
            var expiryDate = new Date(year, month);

            if (expiryDate >= currentDate) {
                return true;
            }
            return false;
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
            limitLength: limitLength,
            isValidExpiryDate: isValidExpiryDate
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

(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = "";
        this._isValid = true;

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

        var _this = this;

        // attach model Inputeners
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

                    if (!parameter.domTargetsFound) {
                        _this._domParentElements.form.appendChild(labelFrag);
                        _this._domParentElements.form.appendChild(inputFrag);
                    } else {
                        _this._domParentElements.input.appendChild(inputFrag);
                        _this._domParentElements.label.appendChild(labelFrag);
                    }

                    _this.cacheDom(parameter.id);
                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domElement.value = _this._model.getValue();
                },
                cardType: function() {
                    var cardType = _this._model.getCardType();
                    if(cardType){
                        if(cardType === "maestro") cardType = "mastercard";
                        if(cardType === "visaelectron")  cardType = "visa";
                        _this._domElement.style.backgroundImage = 'url(../assets/css/images/' + cardType + '.png)';
                    } else{
                        _this._domElement.style.backgroundImage = "none";
                    }
                },
                isValid: function() {
                    var isValid = _this._model.getIsValid();
                    if(isValid){
                        // todo: apply class, not set color
                        _this._domElement.style.borderColor = "black";
                    } else{
                        _this._domElement.style.borderColor = "red";
                    }
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            this._domElement = this._domParentElements.form.querySelectorAll('[data-beanstream-id=' + id + ']')[0];

        },
        attachDomListeners: function() {
            var _this = this;

            this._domElement.addEventListener('keydown', function(e) {
                _this.keydown.notify(e);
            }, false);
            this._domElement.addEventListener('keyup', function(e) {
                var args = {event: e, inputValue: _this._domElement.value};
                _this.keyup.notify(args);
            }, false);
            this._domElement.addEventListener('paste', function(e) {
                _this.paste.notify(e);
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

        self.cardTypeChanged = new beanstream.Event(this);

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
                
                if(self._config.autocomplete === "cc-number"){
                    var cardType = beanstream.Validator.getCardType(args.inputValue);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.getLuhnChecksum(newStr);
                    self._model.setIsValid(isValid);
                }
                if(self._config.autocomplete === "cc-exp"){
                    var isValid = beanstream.Validator.isValidExpiryDate(args.inputValue, new Date());
                    self._model.setIsValid(isValid);
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

            switch(self._config.autocomplete) {
                case "cc-number":
                    newStr = beanstream.Validator.formatCardNumber(newStr);
                    var cardType = beanstream.Validator.getCardType(newStr);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.getLuhnChecksum(newStr);
                    self._model.setIsValid(isValid);
                    break;
                case "cc-csc":
                    // See note in Validator.limitLength
                    console.log();
                    newStr = beanstream.Validator.limitLength(newStr, "cvcLength", self._config.cardType);
                    break;
                case "cc-exp":
                    newStr = beanstream.Validator.formatExpiry(newStr);
                    var isValid = beanstream.Validator.isValidExpiryDate(newStr, new Date());
                    self._model.setIsValid(isValid);
                    break;
                default:
                    break;
            }
            
            self._model.setValue(newStr);
        },

        setCardType: function(cardType) {
            var self = this;  
            var currentType = self._model.setCardType(cardType);   
            if(cardType != currentType ){   
                self._model.setCardType(cardType); // update model for viey
                self.cardTypeChanged.notify(cardType); //emit event for form
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
        this.inputTemplate = '<input id="{{id}}" data-beanstream-id="{{id}}" placeholder="{{placeholder}}" autocomplete="{{autocomplete}}"></input>';

        this.labelTemplate = '<label for="{{id}}">{{labelText}}</label>';
    }

    InputTemplate.prototype.show = function(parameter) {

        var template = {};
        template.label = this.labelTemplate;
        template.input = this.inputTemplate;

        template.label = template.label.replace('{{id}}', parameter.id);
        template.label = template.label.replace('{{labelText}}', parameter.labelText);
        template.input = template.input.replace(/{{id}}/gi, parameter.id);
        template.input = template.input.replace('{{placeholder}}', parameter.placeholder);
        template.input = template.input.replace('{{autocomplete}}', parameter.autocomplete);

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
            labelText: "Expires MM/YYYY",
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

        this.domTargets.cc_number_input = this.form.querySelectorAll('[data-beanstream-target="cc_number_input"]')[0];
        this.domTargets.cc_exp_input = this.form.querySelectorAll('[data-beanstream-target="cc_exp_input"]')[0];
        this.domTargets.cc_cvv_input = this.form.querySelectorAll('[data-beanstream-target="cc_cvv_input"]')[0];

        this.domTargets.cc_number_label = this.form.querySelectorAll('[data-beanstream-target="cc_number_label"]')[0];
        this.domTargets.cc_exp_label = this.form.querySelectorAll('[data-beanstream-target="cc_exp_label"]')[0];
        this.domTargets.cc_cvv_label = this.form.querySelectorAll('[data-beanstream-target="cc_cvv_label"]')[0];

        this.config.domTargetsFound = true;
        for (t in this.domTargets) {
            this.config.domTargetsFound = (this.domTargets[t] != undefined);
            if (!this.config.domTargetsFound) break;
        }

    }

    function readAttributes() {
        // Looks like we currently do not need any configuration

        //this.config.flag = (this.script.getAttribute('data-styled') === 'true');
    }

    function attachDomListeners() {
        window.onload = function(event) {
            // validate and get token before submit event
            // button is below script tag, so we wait until it loads
            this.submitBtn = this.form.querySelectorAll("input[type=submit]")[0];
            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelectorAll("button[type=submit]")[0];
            }


            this.submitBtn.addEventListener("click", onSubmit, false);
        };

    }

    function onSubmit(event) {
        console.log("onSubmit");
        this.submitBtn = this.form.querySelectorAll("input[type=submit]")[0];
        if (!this.submitBtn) {
            this.submitBtn = this.form.querySelectorAll("button[type=submit]")[0];
        }

        event.preventDefault();
        this.submitBtn.disabled = true;

        // toDo: add check for field validation

        // dummy data while testing the rest api call
        var data = {
                    "number":"5100000010001004",
                    "expiry_month":"02",
                    "expiry_year":"14",
                    "cvd":"642"
                    }
        var ajaxHelper = new beanstream.AjaxHelper();
        ajaxHelper.getToken(data, function(args) {
            console.log("app. token response: "+args);
        });




        console.log("submit");

        //this.form.submit();
        this.submitBtn.disabled = false;
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
            if (this.config.domTargetsFound) {
                domTargets.input = this.domTargets[field + "_input"];
                domTargets.label = this.domTargets[field + "_label"];
            }
            domTargets.form = this.form;

            var config = new Object;
            config.domTargetsFound = this.config.domTargetsFound;
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

        if(field){
            field.controller.cardTypeChanged.attach(function(sender, cardType) {
                setCardType(cardType)
            });
        }
    }

    function setCardType(cardType) {
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_cvv";
            });
        field = field[0];

        if(field){
            field.controller._config.cardType = cardType;
        }
    }

    function fireLoadedEvent() {
        var event = new Event('beanstream_loaded');
        document.dispatchEvent(event);

    }

    function init() {
        this.config = {};

        cacheDom();
        attachDomListeners();

        // todo: replace with to absolute link
        injectStyles("../assets/css/style.css");
        injectFields();

        fireLoadedEvent();
    }
    init();

})();