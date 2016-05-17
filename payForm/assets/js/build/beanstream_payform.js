
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function IframeModel() {

    }

    IframeModel.prototype = {

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeModel = IframeModel;
})(window);

(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function IframeView(model, template) {
        var self = this;
        self._model = model;
        this._template = template;
    }

    IframeView.prototype = {

        init: function() {
            var self = this;
            self.cacheDom();
        },
        render: function(path, config) {
            var self = this;
            var template = self._template.show('iframe', {'path': path, 'config': config});

            if (document.querySelector('button[data-beanstream]') === null) {
                template = template + self._template.show('button', {});
            }

            var frag = self.createDocFrag(template);
            self.form.appendChild(frag);
        },
        cacheDom: function() {
            // http://stackoverflow.com/a/22745553
            // there may be multiple 'buy' buttons in a page, get ref to current button
            var scripts = document.getElementsByTagName('script');
            this.script = scripts[ scripts.length - 1 ];
            this.form = this.script.parentNode;
            this.head = document.getElementsByTagName('head')[0];
            this.body = document.getElementsByTagName('body')[0];
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
        readAttributes: function() {
            var attributes = {};
            attributes.image = this.script.getAttribute('data-image');
            attributes.name = this.script.getAttribute('data-name');
            attributes.description = this.script.getAttribute('data-description');
            attributes.amount = this.script.getAttribute('data-amount');
            attributes.billingAddress = this.script.getAttribute('data-billingAddress');
            attributes.shippingAddress = this.script.getAttribute('data-shippingAddress');
            attributes.currency = this.script.getAttribute('data-currency');
            attributes.primaryColor = this.script.getAttribute('data-primaryColor');
            attributes.parentDomain =
                location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

            return attributes;
        },

        attachListeners: function() {
            var self = this;
            if (!this.button) {
                //data-beanstream
                this.button = document.querySelector('button[data-beanstream]');
            }

            if (!this.iframe) {
                this.iframe = this.form.getElementsByTagName('iframe')[0];
            }

            this.button.addEventListener('click', function(e) {
                console.log('click');
                e.preventDefault();
                e = e || window.event;
                this.iframe.parentNode.style.display = 'block';

                var production;
                if (production) {
                    // Ensure postmessage goes to production
                    this.iframe.contentWindow.postMessage(
                        '{"type":"beanstream_openPayform", "detail":""}', 'https://payform.beanstream.com');
                } else if ('localhost' === document.domain) {
                    this.iframe.contentWindow.postMessage(
                    '{"type":"beanstream_openPayform", "detail":""}', 'http://localhost:8000');
                } else {
                    // staging
                    this.iframe.contentWindow.postMessage(
                        '{"type":"beanstream_openPayform", "detail":""}', 's3-us-west-2.amazonaws.com');
                }
            }.bind(self), false);

            window.addEventListener('message', function(event) {

                var production;
                if (production) {
                    // Ensure postmessage came from production
                    if (event.origin !== 'https://payform.beanstream.com') {
                        return;
                    }
                }

                var obj = JSON.parse(event.data);
                var type = obj.type;
                var detail = obj.detail;

                if (type === 'beanstream_closePayform') {

                    this.iframe.parentNode.style.display = 'none';
                } else if (type === 'beanstream_toknizationForm_complete') {

                    if (detail.billingAddress) {
                        var billing = detail.billingAddress;
                        for (var key in billing) {

                            if (billing.hasOwnProperty(key)) {
                                var name = 'billingAddress_' + key;
                                this.appendValue(name, billing[key]);
                            }
                        }
                    }
                    if (detail.shippingAddress) {
                        var shipping = detail.shippingAddress;
                        for (var key in shipping) {
                            if (shipping.hasOwnProperty(key)) {
                                var name = 'shippingAddress_' + key;
                                this.appendValue(name, billing[key]);
                            }
                        }
                    }
                    if (detail.cardInfo) {
                        var card = detail.cardInfo;
                        for (var key in card) {
                            if (card.hasOwnProperty(key)) {
                                var name = 'cardInfo_' + key;
                                this.appendValue(name, card[key]);
                            }
                        }
                    }

                    // call submit form if configured
                    if (this.script.getAttribute('data-submitForm').toLowerCase() === 'true') {
                        this.iframe.parentNode.submit();
                    }

                    beanstream.Helper.fireEvent('beanstream_payform_complete', detail, window.parent.document);
                }
            }.bind(self), false);
        },

        appendValue: function(name, value) {
            var input = this.form.querySelector('input[name=' + name + ']');

            if (input) {
                input.value = value;
            } else {
                console.log('not found');
            }
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeView = IframeView;
})(window);

(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function IframeController(model, view) {
        var self = this;
        self._model = model;
        self._view = view;

    }

    IframeController.prototype = {

        init: function() {
            var self = this;
            self._view.init();
            self._view.render(self.createQueryString(), self._view.readAttributes());
            self._view.attachListeners();
        },
        createQueryString: function() {
            var self = this;

            // This path is updated for production and staging by gulp script
            return 'http://localhost:8000/tokenizationform/test.html?' +
                self.serialize(self._view.readAttributes());
        },

        serialize: function(obj) {
            // source: http://stackoverflow.com/a/1714899
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
            }

            return str.join('&');
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeController = IframeController;
})(window);

(function(window) {
    'use strict';

    function IframeTemplate() {
        var self = this;

        // toDo: accept config as peramater and build template like tekenization form
        self.template = {};
        self.template.button = '<button data-beanstream>Pay with Card</button>';
        self.template.main =
            '<div ' +
                'style="z-index: 2147483647; display: none;' +
                'overflow-x: hidden; overflow-y: auto;' +
                'position: fixed; ' +
                'left: 0px; top: 0px; width: 100%; height: 100vh; -webkit-overflow-scrolling: touch;">' +
			'<iframe frameborder="0"' +
				'allowtransparency="true"' +
				'src="{{path}}"' +
				'style="border: 0px none transparent;' +
                        'overflow-x: hidden; overflow-y: auto; visibility: visible; margin: ' +
                        '0px; padding: 0px; -webkit-tap-highlight-color: transparent; width: 100%; height: 100%">' +
			'</iframe>' +
            '</div>';

        self.template.cardInfo =
            '<input type="hidden" name="cardInfo_code" value="">' +
            '<input type="hidden" name="cardInfo_name" value="">' +
            '<input type="hidden" name="cardInfo_email" value="">';

        self.template.shippingAddress =
            '<input type="hidden" name="shippingAddress_name" value="">' +
            '<input type="hidden" name="shippingAddress_address_line1" value="">' +
            '<input type="hidden" name="shippingAddress_postal_code" value="">' +
            '<input type="hidden" name="shippingAddress_city" value="">' +
            '<input type="hidden" name="shippingAddress_country" value="">' +
            '<input type="hidden" name="shippingAddress_province" value="">';

        self.template.billingAddress =
            '<input type="hidden" name="billingAddress_name" value="">' +
            '<input type="hidden" name="billingAddress_address_line1" value="">' +
            '<input type="hidden" name="billingAddress_postal_code" value="">' +
            '<input type="hidden" name="billingAddress_city" value="">' +
            '<input type="hidden" name="billingAddress_country" value="">' +
            '<input type="hidden" name="billingAddress_province" value="">';
    }

    IframeTemplate.prototype = {

        show: function(templateCmd, parameter) {
            //show: function(path, config) {
            //parameter.path, parameter.config
            var self = this;

            var templateCommands = {
                iframe: function() {
                    var path = parameter.path;
                    var config = parameter.config;

                    var template = self.template.main;
                    template = template.replace('{{path}}', path);

                    template = template + self.template.cardInfo;
                    if (config.billingAddress) {
                        template = template + self.template.billingAddress;
                    }
                    if (config.shippingAddress) {
                        template = template + self.template.shippingAddress;
                    }
                    return template;
                },
                button: function() {
                    return self.template.button;
                }
            };

            return templateCommands[templateCmd]();
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeTemplate = IframeTemplate;
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

(function() {

    console.log('Starting Beanstream Payform...');

    var iframe = {};
    iframe.model = new beanstream.IframeModel();
    iframe.template = new beanstream.IframeTemplate();
    iframe.view = new beanstream.IframeView(iframe.model, iframe.template);
    iframe.controller = new beanstream.IframeController(iframe.model, iframe.view);

    iframe.controller.init();

})();
