(function(window) {
    'use strict';

    /**
    * Library containing shared functions
    */
    var Helper = (function() {

        /**
         * Checks if an event was triggered by a navigation key
         * This function is intended to avoid preventing events related to keyboard navigation
         *
         * @param {Event} event
         * @return {Boolean}
         */
        function isNonInputKey(event) {

            if (event.ctrlKey ||
                event.metaKey ||
                event.keyCode === 8 || // backspace
                event.keyCode === 9 || // tab
                event.keyCode === 13 || // enter
                event.keyCode === 33 || // page up
                event.keyCode === 34 || // page down
                event.keyCode === 35 || // end
                event.keyCode === 36 || // home
                event.keyCode === 37 || // left arrow
                event.keyCode === 39 || // right arrow
                event.keyCode === 45 || // insert
                event.keyCode === 46 // delete
            ) {
                return true;
            }
            return false;
        }

        /**
         * Checks id an object is empty
         * Source: http://stackoverflow.com/a/814649
         *
         * @param {String} htmlStr
         * @return {DocumentFragment} frag
         */
        function createDocFrag(htmlStr) {
            var frag = document.createDocumentFragment();
            var temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        }

        /**
         * Checks id an object is empty
         * Source: http://stackoverflow.com/a/4994244/6011159
         *
         * @param {Object} obj
         * @return {Boolean}
         */
        function isEmpty(obj) {
            if (obj === null) {
                return true;
            }
            if (obj.length > 0) {
                return false;
            }
            if (obj.length === 0) {
                return true;
            }

            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }

            return true;
        }

        function fireEvent(title, eventDetail, element) {
            var element = typeof element !== 'undefined' ?  element : document;
            var event = document.createEvent('Event');
            event.initEvent(title, true, true);
            event.eventDetail = eventDetail;
            element.dispatchEvent(event);
        }

        function toSentenceCase(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() +
                txt.substr(1).toLowerCase();});
        }

        return {
            isNonInputKey: isNonInputKey,
            createDocFrag: createDocFrag,
            isEmpty: isEmpty,
            fireEvent: fireEvent,
            toSentenceCase: toSentenceCase,
            toTitleCase: toTitleCase
        };
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

        function getLuhnChecksum(numStr) {
            numStr = numStr.replace(/\s+/g, '');
            var digit;
            var sum = 0;
            var numArray = numStr.split('').reverse();

            for (var i = 0; i < numArray.length; i++) {
                digit = numArray[i];
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
        }

        function formatCardNumber(str) {
            str = str.replace(/\s+/g, '');
            var cardType = getCardType(str);

            var card = cards.filter(function(c) {
                return c.type === cardType;
            });

            card = card[0];

            if (card) {
                var format = card.format;

                if (format.global) {
                    var arr = str.match(format).join(' ');
                    str = limitLength(arr, 'length', cardType);
                } else {
                    var arr = format.exec(str);
                    arr.shift();// remove first element which contains the full matched text
                    str = arr.join(' ');
                    str = str.trim();// remove whitespaces seperating empty arrays - all patterns not yet matched
                }
            }

            return str;
        }

        function formatExpiry(str) {
            var parts = str.match(/^\D*(\d{1,2})(\D+)?(\d{1,2})?/);

            if (!parts) {
                return '';
            }

            var mon = parts[1] || '';
            var sep = parts[2] || '';
            var year = parts[3] || '';

            if (year.length > 0) {
                sep = ' / ';
            } else if (sep === ' /') {
                mon = mon.substring(0, 1);
                sep = '';
            } else if (mon.length === 2 && (parseInt(mon) > 12)) {
                mon = '1';
            } else if (mon.length === 2 || sep.length > 0) {
                sep = ' / ';
            } else if (mon.length === 1 && (mon !== '0' && mon !== '1')) {
                mon = '0' + mon;
                sep = ' / ';
            }

            return mon + sep + year;
        }

        function limitLength(str, fieldType, cardType) {
            if ((fieldType !== 'length' && fieldType !== 'cvcLength') || cardType === undefined || cardType === '') {
                return str;
            }

            var max = getMaxLength(fieldType, cardType);

            // adjust for whitespacing in creditcard str
            var whiteSpacing = (str.match(new RegExp(' ', 'g')) || []).length;

            // trim() is needed to remove final white space
            str = str.substring(0, max + whiteSpacing).trim();

            return str;
        }

        function getMaxLength(fieldType, cardType) {
            var card = cards.filter(function(c) {
                return c.type === cardType;
            });
            card = card[0];

            var lengths = card[fieldType];
            var max = Math.max.apply(Math, lengths);
            return max;
        }

        function getMaxLength(fieldType, cardType) {
            var card = cards.filter(function(c) {
                return c.type === cardType;
            });
            card = card[0];

            var lengths = card[fieldType];
            var max = Math.max.apply(Math, lengths);
            return max;
        }

        function isValidExpiryDate(str, currentDate, onBlur) {
            if (onBlur && str === '') {
                // Validate onBlur as required field
                return {isValid: false, error: 'Please enter an expiry date.', fieldType: 'expiry'};
            }

            // expects str in format 'mm/yyyy'
            var arr = str.split('/');
            // JavaScript counts months from 0 to 11
            var month = arr[0];

            if (month) {
                month = month.trim() - 1;
            }

            var year = arr[1];

            if (year) {
                year = year.trim();

                if (year.length === 2) {
                    year = '20' + year;

                    var expiryDate = new Date(year, month);

                    if (expiryDate < currentDate) {
                        return {isValid: false, error: 'Please enter a valid expiry date. The date entered is past.',
                            fieldType: 'expiry'};
                    }
                } else if (onBlur) {
                    // Validate onBlur as required field
                    return {isValid: false, error: 'Please enter an expiry date.', fieldType: 'expiry'};
                }
            }
            if (onBlur) {
                if (year) {
                    year = year.trim();
                    year = '20' + year;
                } else {
                    year = 0;
                }

                var expiryDate = new Date(year, month);

                if (expiryDate < currentDate) {
                    return {isValid: false, error: 'Please enter a valid expiry date. The date entered is past.',
                        fieldType: 'expiry'};
                }
            }

            return {isValid: true, error: '', fieldType: 'expiry'};
        }

        function getCardType(str) {
            var cardType = '';

            loop1:

            for (var i = 0; i < cards.length; i++) {
                var patterns = cards[i].patterns;
                loop2:

                for (var j = 0; j < patterns.length; j++) {
                    var pos = str.indexOf(patterns[j]);

                    if (pos === 0) {
                        cardType = cards[i].type;
                        break loop1;
                    }
                }
            }

            return cardType;
        }

        function isValidCardNumber(str, onBlur) {
            str = str.replace(/\s+/g, '');
            var cardType = '';
            var max = 0;

            if (str.length > 0) {
                cardType = getCardType(str);

                if (cardType) {
                    max = getMaxLength('length', cardType);
                }
            }

            if (onBlur) {
                if (str.length === 0) {
                    // Validate onBlur as required field
                    return {isValid: false, error: 'Please enter a credit card number.', fieldType: 'number'};
                } else if (cardType === '') {
                    return {isValid: false, error: 'Please enter a valid credit card number.', fieldType: 'number'};
                } else if (str.length < max) {
                    // if onBlur and str not complete
                    return {isValid: false,
                            error: 'Please enter a valid credit card number. The number entered is too short.',
                            fieldType: 'number'};
                } else {
                    var luhn = getLuhnChecksum(str);

                    if (luhn) {
                        return {isValid: true, error: '', fieldType: 'number'};
                    } else {
                        return {isValid: false, error: 'Please enter a valid credit card number.', fieldType: 'number'};
                    }
                }

            } else {
                if (str.length === max && max !== 0) {
                    var luhn = getLuhnChecksum(str);

                    if (luhn) {
                        return {isValid: true, error: '', fieldType: 'number'};
                    } else {
                        return {isValid: false, error: 'Please enter a valid credit card number.', fieldType: 'number'};
                    }
                }

            }

            return {isValid: true, error: '', fieldType: 'number'};// Report valid while user is inputting str
        }

        function isValidCvc(cardType, str, onBlur) {
            if (onBlur && str.length === 0) {
                return {isValid: false, error: 'Please enter a CVV number.', fieldType: 'cvv'};
            }

            if (cardType === '') {
                return {isValid: true, error: '', fieldType: 'cvv'}; // Unknown card type. Default to true
            }

            var max = getMaxLength('cvcLength', cardType);

            if (str.length < max && onBlur === true) {
                return {isValid: false,
                        error: 'Please enter a valid CVV number. The number entered is too short.',
                        fieldType: 'cvv'};
            }

            return {isValid: true, error: '', fieldType: 'cvv'};
        }

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
        };
    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Validator = Validator;
})(window);

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

(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = '';
        this._isValid = true;
        this._cardType = '';
        this._fieldType = '';
        this._error = '';
        this._caretPos = 0;

        this.valueChanged = new beanstream.Event(this);
        this.validityChanged = new beanstream.Event(this);
        this.cardTypeChanged = new beanstream.Event(this);
    }

    InputModel.prototype = {
        getValue: function() {
            return this._value;
        },
        setValue: function(value) {
            if (value !== this._value) {
                this._value = value;
                this.valueChanged.notify();
            }
        },
        getIsValid: function() {
            return this._isValid;
        },
        setIsValid: function(valid) {
            if (valid !== this._isValid) {
                this._isValid = valid;
                this.validityChanged.notify();
            }
        },
        getCardType: function() {
            return this._cardType;
        },
        setCardType: function(cardType) {
            if (cardType !== this._cardType) {
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
        },
        getCaretPos: function() {
            return this._caretPos;
        },
        setCaretPos: function(pos) {
            this._caretPos = pos;
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

        // this._domParentElement = domParentElements;
        if (domParentElements.form) {
            this._domParentElement = domParentElements.form;
        }

        this.keydown = new beanstream.Event(this);
        this.keyup = new beanstream.Event(this);
        this.paste = new beanstream.Event(this);
        this.blur = new beanstream.Event(this);
        this.focus = new beanstream.Event(this);

        var _this = this;

        // attach model Listeners
        this._model.valueChanged.attach(function() {
            _this.render('value', '');
        });
        this._model.cardTypeChanged.attach(function() {
            _this.render('cardType', '');
        });
        this._model.validityChanged.attach(function() {
            _this.render('isValid', '');
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

                    if (parameter.inputDomTargets) {
                        // If a dom target is found do not append label
                        _this._domParentElements.input.appendChild(inputFrag);
                    } else {
                        _this._domParentElements.form.appendChild(labelFrag);
                        _this._domParentElements.form.appendChild(inputFrag);
                    }

                    if (parameter.errorDomTargets) {
                        _this._domParentElements.error.appendChild(errorFrag);
                    } else if (!parameter.errorDomTargets && parameter.inputDomTargets) {
                        // don't append an error if...
                        // _this._domParentElements.input.appendChild(errorFrag);
                    } else {
                        _this._domParentElements.form.appendChild(errorFrag);
                    }
                    _this.cacheDom(parameter.id);

                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domInputElement.value = _this._model.getValue();

                    // Do not reposition caret for date
                    if (_this._model.getFieldType() !== 'cc-exp') {
                        var pos =  _this._model.getCaretPos();
                        _this._domInputElement.setSelectionRange(pos, pos);
                    }
                },
                cardType: function() {
                    var fieldType = _this._model.getFieldType();

                    if (fieldType === 'cc-number') {
                        var cardType = _this._model.getCardType();

                        if (cardType) {
                            if (cardType === 'maestro') {
                                cardType = 'mastercard';
                            }
                            if (cardType === 'visaelectron') {
                                cardType = 'visa';
                            }
                            _this._domInputElement.style.backgroundImage =
                                'url(http://downloads.beanstream.com/images/payform/' + cardType + '.png)';
                        } else {
                            _this._domInputElement.style.backgroundImage =
                                'url(http://downloads.beanstream.com/images/payform/card.png)';
                        }
                    }
                },
                csc: function() {
                    var fieldType = _this._model.getFieldType();

                    if (fieldType === 'cc-csc') {
                        var cardType = _this._model.getCardType();
                        var onBlur = parameter;

                        if (cardType && cardType === 'amex') {
                            if (!onBlur) {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_color_amex.png)';
                            } else {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_mono_amex.png)';
                            }
                        } else if (cardType) {
                            if (!onBlur) {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_color.png)';
                            } else {
                                _this._domInputElement.style.backgroundImage =
                                    'url(http://downloads.beanstream.com/images/payform/cvc_hint_mono.png)';
                            }
                        }
                    }
                },
                isValid: function() {
                    var isValid = _this._model.getIsValid();

                    if (isValid) {
                        _this._domInputElement.classList.remove('beanstream_invalid');
                    } else {
                        _this._domInputElement.classList.add('beanstream_invalid');
                    }
                    if (_this._domErrorElement) {
                        _this._domErrorElement.innerHTML = _this._model.getError();
                    }
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            this._domInputElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + ']');
            this._domErrorElement = this._domParentElements.form.querySelector('[data-beanstream-id=' + id + '_error]');
        },
        attachDomListeners: function() {
            var _this = this;

            this._domInputElement.addEventListener('keydown', function(e) {
                e = e || window.event;
                _this.keydown.notify(e);
            }, false);
            this._domInputElement.addEventListener('keyup', function(e) {
                e = e || window.event;
                var args = {event: e, inputValue: _this._domInputElement.value};
                _this.keyup.notify(args);
            }, false);
            this._domInputElement.addEventListener('paste', function(e) {
                e = e || window.event;
                _this.paste.notify(e);
            }, false);
            this._domInputElement.addEventListener('blur', function(e) {
                e = e || window.event;
                _this.blur.notify(e);
            }, false);
            this._domInputElement.addEventListener('focus', function(e) {
                e = e || window.event;
                _this.focus.notify(e);
            }, false);
        },
        createDocFrag: function(htmlStr) {
            // http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
            var frag = document.createDocumentFragment();
            var temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        },
        getCaretOffset: function(el) {
            // http://stackoverflow.com/a/2897229/6011159
            var el = this._domInputElement;
            var pos = 0;

            // IE Support
            if (document.selection) {
                var sel = document.selection.createRange();
                sel.moveStart('character', -el.value.length);
                pos = sel.text.length;
            }

            // Firefox support
            else if (el.selectionStart || el.selectionStart == '0') {
                pos = el.selectionStart;
            }

            return pos;
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

        // notifier for view
        self._view.render('elements', self._config);

        // listen to view events
        self._view.keydown.attach(function(sender, e) {
            // delete whole date str on delete any char
            if ((self._model.getFieldType() === 'cc-exp') &&
                    (e.keyCode === 8 || e.keyCode === 46)) {

                self._model.setValue('');
                return;
            }

            // Don't override default functionality except for input
            if (beanstream.Helper.isNonInputKey(e)) {
                return;
            }
            e.preventDefault();

            var char;

            // Handle keypad
            if (e.keyCode >= 96 && e.keyCode <= 105) {
                char = String.fromCharCode(e.keyCode - 48);
            } else {
                char = String.fromCharCode(e.keyCode);
            }

            var selectedText = {};
            selectedText.start = e.target.selectionStart;
            selectedText.end = e.target.selectionEnd;

            self.limitInput(char, selectedText);
        });

        self._view.keyup.attach(function(sender, args) {
            if (args.event.keyCode === 8 || args.event.keyCode === 46) {
                // Update model directly from UI on delete
                // keyup is only needed for deletion

                var pos = self._view.getCaretOffset();
                self._model.setCaretPos(pos);

                self._model.setValue(args.inputValue);

                var onBlur = false;
                var value = self._model.getValue();
                self.validate(onBlur, value);
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
            var value = self._model.getValue();
            self.validate(onBlur, value);

        });

        self._view.focus.attach(function(sender, e) {
            var str = self._model.getValue();

            if (self._model.getFieldType() === 'cc-csc') {
                var onBlur = false;
                self._view.render('csc', false);
            }
        });
    }

    InputController.prototype = {
        limitInput: function(str, selectedText) {
            var self = this;

            str = str.replace(/\D/g, ''); // remove non ints from string

            if (!str.length) {
                return;
            }

            // Remove any text selected in ui
            var currentStr = self._model.getValue();
            currentStr =  currentStr.replace(
                currentStr.substring(
                    selectedText.start,
                    selectedText.end
                ), '');

            // insert new char at cursor position
            var inputStr = [currentStr.slice(0,
                selectedText.start),
                str,
                currentStr.slice(selectedText.start)].join('');

            var newStr = inputStr;

            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    newStr = beanstream.Validator.formatCardNumber(newStr);
                    break;
                }
                case 'cc-csc': {
                    newStr = beanstream.Validator.limitLength(newStr, 'cvcLength', self._model.getCardType());
                    break;
                }
                case 'cc-exp': {
                    newStr = beanstream.Validator.formatExpiry(newStr);
                    break;
                }
                default: {
                    break;
                }
            }

            var onBlur = false;
            self.validate(onBlur, newStr);

            // Calculate new caret position
            var caretPos = selectedText.start + str.length; // get caret pos on original string
            inputStr = inputStr.substring(0, caretPos); // remove white spacing
            inputStr = inputStr.replace(/\s+/g, '');
            var match = inputStr.split('').join('\\s*'); // create string for RegEx insensitive to white spacing
            match = new RegExp(match);
            var res = newStr.match(match);

            if (res) {
                res = res[0].toString(); // find unformatted substring in formatted string
                var caretPos = res.length;
                self._model.setCaretPos(caretPos);
            }

            self._model.setValue(newStr);

            if (self._model.getIsValid()) {
                var cardType = self._model.getCardType();
                if (cardType !== '' || self._model.getFieldType() === 'cc-exp') {
                    self.updateFocus(newStr, self._model.getCardType());
                }
            }
        },
        setCardType: function(cardType) {
            var self = this;
            var currentType = self._model.setCardType(cardType);

            if (cardType !== currentType) {
                self._model.setCardType(cardType); // update model for view
                self.cardTypeChanged.notify(cardType); // emit event for form
            }

            // limit and validate csc input if present
            if (self._model.getFieldType() === 'cc-csc') {
                var onBlur = false;
                var value = self._model.getValue();
                value = beanstream.Validator.limitLength(value, 'cvcLength', self._model.getCardType());
                self._model.setValue(value);
                self.validate(onBlur, value);
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
            str = str.replace(/\s+/g, ''); // remove white spaces from string
            var len = str.length;

            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    max = beanstream.Validator.getMaxLength('length', cardType);
                    break;
                }
                case 'cc-csc': {
                    max = beanstream.Validator.getMaxLength('cvcLength', cardType);
                    break;
                }
                case 'cc-exp': {
                    max = 5; // Format: "MM / YY", minus white spacing
                    break;
                }
                default: {
                    break;
                }
            }

            if (max === len) {
                self.inputComplete.notify();
            }
        },
        validate: function(onBlur, value) {
            var self = this;
            if (value === undefined) {
                value = self._model.getValue();
            }

            switch (self._model.getFieldType()) {
                case 'cc-number': {
                    var cardType = beanstream.Validator.getCardType(value);
                    self.setCardType(cardType);
                    var isValid = beanstream.Validator.isValidCardNumber(value, onBlur);
                    self.setInputValidity(isValid);
                    break;
                }
                case 'cc-csc': {
                    var cardType = self._model.getCardType();
                    var isValid = beanstream.Validator.isValidCvc(cardType, value, onBlur);
                    self.setInputValidity(isValid);
                    self._view.render('csc', onBlur);
                    break;
                }
                case 'cc-exp': {
                    var isValid = beanstream.Validator.isValidExpiryDate(value, new Date(), onBlur);
                    self.setInputValidity(isValid);
                    break;
                }
                default: {
                    break;
                }
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
        this.inputTemplate =    '<input data-beanstream-id="{{id}}" ' +
                                'placeholder="{{placeholder}}" autocomplete="{{autocomplete}}">';
        this.labelTemplate =    '<label data-beanstream-id="" for="{{id}}">{{labelText}}</label>';
        this.errorTemplate =    '<div data-beanstream-id="{{id}}_error"></div>';
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

(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function FormModel() {
        this._token = '';

        this._fields = {
            ccNumber: {
                name: 'cardnumber',
                labelText: 'Credit Card Number',
                placeholder: '',
                autocomplete: 'cc-number'
            },
            ccCvv: {
                name: 'cvc',
                labelText: 'CVC',
                placeholder: '',
                autocomplete: 'cc-csc'
            },
            ccExp: {
                name: 'cc-exp',
                labelText: 'Expires MM/YY',
                placeholder: '',
                autocomplete: 'cc-exp'
            }
        };

        this._domTargetsFound = {inputs: false, errors: false};
        this.tokenChanged = new beanstream.Event(this);
        this.domTargetsFoundChanged = new beanstream.Event(this);
    }

    FormModel.prototype = {
        getToken: function() {
            return this._token;
        },
        setToken: function(token) {
            if (token !== this._token) {
                this._token = token;
                this.tokenChanged.notify();
            }
        },
        getFields: function() {
            return this._fields;
        },
        getDomTargetsFound: function(key) {
            return this._domTargetsFound[key];
        },
        setDomTargetsFound: function(key, value) {
            if (value !== this._domTargetsFound[key]) {
                this._domTargetsFound[key] = value;
                this.domTargetsFoundChanged.notify();
            }
        },
        getSubmitForm: function() {
            return this._submitForm;
        },
        setSubmitForm: function(value) {
            this._submitForm = value;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormModel = FormModel;
})(window);

(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function FormView(model) {
        this._model = model;
        this.submit = new beanstream.Event(this);
    }

    FormView.prototype = {
        init: function() {
            var self = this;
            self.cacheDom();
            self.readAttributes();
            self.attachDomListeners();
        },
        cacheDom: function(id) {
            // http://stackoverflow.com/a/22745553
            // there may be multiple forms in a page, get ref to current form
            var scripts = document.getElementsByTagName('script');
            this.script = scripts[scripts.length - 1];
            this.form = this.script.parentNode;
            this.head = document.getElementsByTagName('head')[0];
            this.submitBtn = this.form.querySelector('input[type=submit]');

            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelector('button[type=submit]');
            }

            this.domTargets = {};

            var fields = this._model.getFields();

            for (var field in fields) {
                var input = field + '_input';
                var error = field + '_error';

                this.domTargets[input] =
                    this.form.querySelector('[data-beanstream-target=' + input + ']');

                this.domTargets[error] =
                    this.form.querySelector('[data-beanstream-target=' + error + ']');

                // Set flags. If target missing for any input, ignore all input targets
                this._model.setDomTargetsFound('inputs', true);
                this._model.setDomTargetsFound('errors', true);

                if (this.domTargets[input] === null) {
                    this._model.setDomTargetsFound('inputs', false);
                }
                if (this.domTargets[error] === null) {
                    this._model.setDomTargetsFound('errors', false);
                }
            }
        },
        readAttributes: function() {
            var self = this;
            var submit = self.script.getAttribute('data-submitForm') === 'true';
            this._model.setSubmitForm(submit);
        },
        attachDomListeners: function() {
            var self = this;
            window.onload = function(e) {
                // validate and get token before submit event
                // button is below script tag, so we wait until it loads
                // toDo: change put button above script tag. drop onload event???
                self.submitBtn = self.form.querySelector('input[type=submit]');
                if (!self.submitBtn) {
                    self.submitBtn = self.form.querySelector('button[type=submit]');
                }

                // if there is no submit button don't submit
                if (self.submitBtn) {
                    self.submitBtn.addEventListener('click', function(e) {
                        self.submit.notify(e);
                    }, false);
                }

                self.form.addEventListener('beanstream_payfields_tokenize', function(e) {
                    self.submit.notify(e);
                }.bind(self), false);

            }.bind(self);
        },
        render: function(viewCmd, parameter) {
            var self = this;
            var viewCommands = {
                enableSubmitButton: function(parameter) {
                    if (self.submitBtn) {
                        self.submitBtn.disabled = Boolean(!parameter);
                    }
                },
                injectStyles: function(parameter) {
                    var fileref = document.createElement('link');
                    fileref.setAttribute('rel', 'stylesheet');
                    fileref.setAttribute('type', 'text/css');
                    fileref.setAttribute('href', parameter);

                    if (typeof fileref !== 'undefined') {
                        self.head.appendChild(fileref);
                    }
                },
                appendToken: function(value) {
                    var input = self.form.querySelector('input[name=singleUseToken]');

                    if (input) {
                        input.value = value;
                    } else {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'singleUseToken';
                        input.value = value;
                        self.form.appendChild(input);
                    }
                },
                setFocusNext: function(sender) {
                    var currentEl = sender._config.id;

                    // toDo: these inputs should be cached
                    var inputs = self.form.getElementsByTagName('input');

                    var currentInput = self.getIndexById(inputs, currentEl);

                    if (inputs[currentInput + 1]) {
                        inputs[currentInput + 1].focus();
                    } else {
                        if (self.submitBtn) {
                            self.submitBtn.focus();
                        }
                    }
                }
            };

            viewCommands[viewCmd](parameter);
        },
        getIndexById: function(source, id) {
            for (var i = 0; i < source.length; i++) {
                if (source[i].getAttribute('data-beanstream-id') === id) {
                    return i;
                }
            }
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormView = FormView;
})(window);

(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function FormController(model, view) {
        var self = this;
        self._model = model;
        self._view = view;

        self._view.init();
        self._view.submit.attach(function(sender, e) {
            self.onSubmit(e);
        });
    }

    FormController.prototype = {
        init: function() {
            var self = this;

            // This path is update for production and staging by gulp script
            self._view.render('injectStyles',
                'http://localhost:8000/payfields/assets/css/beanstream_payfields_style.css');

            self.injectFields();

            beanstream.Helper.fireEvent('beanstream_payfields_loaded', {}, document);
        },
        onSubmit: function(e) {
            var self = this;
            e.preventDefault();

            self.validateFields();
            var fields = self.getFieldValues();

            if (!beanstream.Helper.isEmpty(fields)) {
                self._view.render('enableSubmitButton', 'false');

                var data = {'number': fields.number,
                        'expiry_month': fields.expiryMonth,
                        'expiry_year': fields.expiryYear,
                        'cvd': fields.cvd};

                var ajaxHelper = new beanstream.AjaxHelper();
                ajaxHelper.getToken(data, function(args) {
                    if (args.success) {
                        self._view.render('appendToken', args.token);
                    } else {
                        console.log('Warning: tokenisation failed. Code: ' + args.code + ', message: ' + args.message);
                    }

                    if (this._model.getSubmitForm()) {
                        self._view.form.submit();
                    } else {
                        beanstream.Helper.fireEvent('beanstream_payfields_tokenUpdated', args, document);
                    }
                    self._view.render('enableSubmitButton', 'true');
                }.bind(self));
            } else {
                self._view.render('enableSubmitButton', 'true');
            }
        },
        appendToken: function(form, value) {
            var input = form.querySelector('input[name=singleUseToken]');

            if (input) {
                input.value = value;
            } else {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'singleUseToken';
                input.value = value;
                form.appendChild(input);
            }
        },
        injectFields: function(filename) {
            this.fieldObjs = [];

            var fields = this._model.getFields();

            for (var field in fields) {
                var domTargets = {};
                if (this._model.getDomTargetsFound('inputs')) {
                    domTargets.input = this._view.domTargets[field + '_input'];
                }
                if (this._model.getDomTargetsFound('errors')) {
                    domTargets.error = this._view.domTargets[field + '_error'];
                }
                domTargets.form = this._view.form;

                var config = new Object;
                config.inputDomTargets = this._model.getDomTargetsFound('inputs');
                config.errorDomTargets = this._model.getDomTargetsFound('errors');
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
            var field = this.fieldObjs.filter(function(f) {
                return f.controller._config.id === 'ccNumber';
            });
            field = field[0];

            // attach listeners to new field
            var self = this;

            if (field) {
                field.controller.cardTypeChanged.attach(function(sender, cardType) {
                    self.setCardType(cardType);
                }.bind(self));
            }

            for (field in this.fieldObjs) {
                this.fieldObjs[field].controller.inputComplete.attach(function(sender) {
                    self._view.render('setFocusNext', sender);
                }.bind(self));

                this.fieldObjs[field].controller.inputValidityChanged.attach(function(sender, args) {
                    self.inputValidityChanged(args);
                }.bind(self));
            }
        },
        setCardType: function(cardType) {
            var field = this.fieldObjs.filter(function(f) {
                    return f.controller._config.id === 'ccCvv';
                });
            field = field[0];

            if (field) {
                field.controller.setCardType(cardType);
            }
        },
        inputValidityChanged: function(args) {
            beanstream.Helper.fireEvent('beanstream_payfields_inputValidityChanged', args, document);
        },
        /**
        * Gets card field values from model
        * Returns {} if invalid or empty
        */
        getFieldValues: function() {
            var data = {};

            var invalidFields = this.fieldObjs.filter(function(f) {
                return f.controller._model.getIsValid() === false;
            });

            var emptyFields = this.fieldObjs.filter(function(f) {
                return f.controller._model.getValue() === '';
            });

            if (invalidFields.length === 0 && emptyFields.length === 0) {
                for (var i = 0; i < this.fieldObjs.length; i++) {
                    switch (this.fieldObjs[i].controller._config.id) {
                        case 'ccNumber': {
                            data.number = this.fieldObjs[i].controller._model.getValue();
                            break;
                        }
                        case 'ccCvv': {
                            data.cvd = this.fieldObjs[i].controller._model.getValue();
                            break;
                        }
                        case 'ccExp': {
                            var str = this.fieldObjs[i].controller._model.getValue();
                            var arr = str.split('/');
                            data.expiryMonth = arr[0].trim();
                            data.expiryYear = '20' + arr[1].trim();
                            break;
                        }
                        default: {
                            break;
                        }
                    }

                    this.fieldObjs[i].controller._model.setValue('');
                }
            }

            return data;
        },
        validateFields: function() {
            var self = this;
            var onBlur = true;
            for (var i = 0; i < self.fieldObjs.length; i++) {
                self.fieldObjs[i].controller.validate(onBlur);
            }
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormController = FormController;
})(window);

(function(window) {
    'use strict';

    /**
    * Simple event object that is encapsulated in most other objects
    *
    * @param {this} sender
    */
    function Event(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    Event.prototype = {
        attach: function(Inputener) {
            this._listeners.push(Inputener);
        },
        notify: function(args) {
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
    'use strict';

    /**
    * Entry point for the Payfields app
    * Functionality:
    * 1. Injects card fields into DOM
    * 2. OnSubmit tokenises field content, clears them and appends hidden field to form
    * 3. Fires 'beanstream_tokenUpdated' event to document if 'data-submitForm' attribute is set to false
    */

    console.log('Starting Beanstream Payfields...');

    var form = {};
    form.model = new beanstream.FormModel();
    form.view = new beanstream.FormView(form.model);
    form.controller = new beanstream.FormController(form.model, form.view);

    form.controller.init();
})();
