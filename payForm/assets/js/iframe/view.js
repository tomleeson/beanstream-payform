
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
            var template = self._template.show(path, config);
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

            console.log('attributes.primaryColor: ' + attributes.primaryColor);

            return attributes;
        },
        attachListeners: function() {
            var self = this;
            if (!this.button) {
                this.button = this.form.getElementsByTagName('button')[0];
            }

            if (!this.iframe) {
                this.iframe = this.form.getElementsByTagName('iframe')[0];
            }

            this.button.addEventListener('click', function(e) {
                e.preventDefault();
                e = e || window.event;
                this.iframe.parentNode.style.display = 'block';

                var innerDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
                var form = innerDoc.getElementsByTagName('form')[0];
                beanstream.Helper.fireEvent('beanstream_payform_visible', {}, form);

            }.bind(self), false);

            document.addEventListener('beanstream_closePayform', function() {
                this.iframe.parentNode.style.display = 'none';
                this.iframe.contentWindow.location.reload();
            }.bind(self), false);

            document.addEventListener('beanstream_toknizationForm_complete', function(e) {

                // toDo: append hiddenfields to form and submit if config...
                // toDo: append fields to doc during original render

                if (e.eventDetail.billingAddress) {
                    var billing = e.eventDetail.billingAddress;
                    for (var key in billing) {
                        if (billing.hasOwnProperty(key)) {
                            var name = 'billingAddress_' + key;
                            this.appendValue(name, billing[key]);
                        }
                    }
                }
                if (e.eventDetail.shippingAddress) {
                    var shipping = e.eventDetail.shippingAddress;
                    for (var key in shipping) {
                        if (shipping.hasOwnProperty(key)) {
                            var name = 'shippingAddress_' + key;
                            this.appendValue(name, billing[key]);
                        }
                    }
                }
                if (e.eventDetail.cardInfo) {
                    var card = e.eventDetail.cardInfo;
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

                beanstream.Helper.fireEvent('beanstream_payform_complete', e.eventDetail, window.parent.document);
            }.bind(self), false);
        },
        appendValue: function(name, value) {
            var input = this.iframe.parentNode.querySelector('input[name=' + name + ']');

            if (input) {
                input.value = value;
            }
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeView = IframeView;
})(window);
