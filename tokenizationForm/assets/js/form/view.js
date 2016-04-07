
(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function FormView(model, template) {
        var self = this;
        self._model = model;
        this._template = template;

        this.nextPanel = new beanstream.Event(this);
        this.previousPanel = new beanstream.Event(this);
        this.syncAddresses = new beanstream.Event(this);
        this.tokenUpdated = new beanstream.Event(this);
        this.tokenize = new beanstream.Event(this);
        this.errorsUpdated = new beanstream.Event(this);
    }

    FormView.prototype = {
        init: function(config, panels) {
            var self = this;

            self.render('elements', {config: config, panels: panels});
            self.attachPayfieldsListeners();
            self.render('script');
            self.cacheDom(panels);
            self.attachListeners(panels);

            if (panels.shipping && panels.billing) {
                self.render('navigationRelativeToAddressSync', {sync: true, panels: panels});
            }

        },
        render: function(viewCmd, parameter) {

            var self = this;
            var viewCommands = {
                elements: function() {
                    // parameter.config, parameter.panels
                    if (!self.body) {
                        self.body = document.getElementsByTagName('body')[0];
                    }
                    var template = self._template.show('elements', parameter);
                    var frag = self.createDocFrag(template);
                    self.body.appendChild(frag);
                },
                script: function() {
                    var script = document.createElement('script');

                    /*
                    script.src =
                        'https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/beanstream_payfields.js';
                    */
                    script.src =
                        'http://localhost:8000/payFields/assets/js/build/beanstream_payfields.js';

                    script.setAttribute('data-submit-form', 'false');
                    script.setAttribute('data-tokenize-onSubmit', 'false');
                    var form = document.getElementsByTagName('form')[0];
                    form.appendChild(script);
                },
                currentPanel: function() {
                    // parameter.panels, parameter.old, arameter.new

                    self._domPanels[parameter.new].classList.remove('hidden');

                    if (parameter.old) {
                        self._domPanels[parameter.old].classList.add('hidden');
                        self.focusFirstElement(self._domPanels[parameter.new]);
                    }
                },
                navigationRelativeToAddressSync: function() {
                    // parameter.panels, parameter.sync

                    var shippingNextButton = self._domPanels.shipping.getElementsByTagName('button')[0];
                    var cardBackButton = self._domPanels.card.getElementsByTagName('a')[1];

                    if (parameter.sync) {
                        shippingNextButton.childNodes[0].childNodes[0].innerHTML =
                            beanstream.Helper.toSentenceCase(parameter.panels.billing.next) + ' Info';
                        cardBackButton.innerHTML = '<h6>' +
                            beanstream.Helper.toSentenceCase(parameter.panels.billing.previous) + ' Info</h6>';
                    } else {
                        shippingNextButton.childNodes[0].childNodes[0].innerHTML =
                            beanstream.Helper.toSentenceCase(parameter.panels.shipping.next) + ' Info';
                        cardBackButton.innerHTML = '<h6>' +
                            beanstream.Helper.toSentenceCase(parameter.panels.card.previous) + ' Info</h6>';
                    }

                },
                errorBlock: function() {
                    // parameter.errorMessages, parameter.panel

                    var errorBlock = self._domPanels[parameter.panel].getElementsByClassName('error')[0];

                    // errorBlock.innerHTML = '';
                    while (errorBlock.firstChild) {
                        errorBlock.removeChild(errorBlock.firstChild);
                    }

                    if (parameter.errorMessages.length) {
                        var template = self._template.show('errors', parameter);
                        var frag = self.createDocFrag(template);
                        errorBlock.appendChild(frag);

                        errorBlock.classList.remove('hidden');
                    } else {
                        errorBlock.classList.add('hidden');
                    }

                }
            };

            viewCommands[viewCmd]();
        },
        focusFirstElement: function(panel) {
            panel.querySelectorAll('input[type=text]')[0].focus();
        },
        cacheDom(panels) {
            var self = this;
            self.form = document.getElementsByTagName('form')[0];

            self._domPanels = {};
            for (var key in panels) {
                self._domPanels[key] = document.getElementById(key + '_panel');
            }
        },
        attachListeners: function(panels) {
            var self = this;

            if (panels.shipping) {
                // Next button
                var button = self._domPanels.shipping.getElementsByTagName('button')[0];
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e = e || window.event;
                    self.nextPanel.notify(panels.shipping.name);
                }.bind(self), false);

                // Previous button
                var billingBackButtons = Array.prototype.slice.call(self._domPanels.billing.getElementsByTagName('a'));
                var cardBackButtons = Array.prototype.slice.call(self._domPanels.card.getElementsByTagName('a'));
                var backButtons = billingBackButtons.concat(cardBackButtons);

                for (var i = 0; i < backButtons.length; i++) {
                    backButtons[i].addEventListener('click', self.onPreviousPanelClick.bind(self), false);
                }
            }
            if (panels.billing) {
                var button = self._domPanels.billing.getElementsByTagName('button')[0];
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e = e || window.event;
                    self.nextPanel.notify(panels.billing.name);
                }.bind(self), false);
            }

            if (panels.shipping && panels.billing) {
                var checkbox = self._domPanels.shipping.querySelectorAll('input[type=checkbox]')[0];
                checkbox.addEventListener('click', function(e) {
                    self.syncAddresses.notify(e.target.checked);
                }, false);
            }

            if (panels.card) {
                var button = self._domPanels.card.getElementsByTagName('button')[0];
                button.addEventListener('click', function(e) {
                    e = e || window.event;
                    e.preventDefault();
                    self.tokenize.notify();

                }.bind(self), false);
            }

            var closeButton = document.getElementById('close-button');
            closeButton.addEventListener('click', function(e) {
                var self = this;
                e.preventDefault();
                e = e || window.event;
                self.closeIframe();
            }.bind(self), false);

            self.form.addEventListener('beanstream_Payform_visible', function(e) {
                var self = this;
                self.focusFirstElement(self._domPanels[self._model.getCurrentPanel()]);
                console.log('beanstream_Payform_visible');
            }.bind(self), false);

            // Add listeners to all inputs on shipping and billing panels
            var shippingInputs = [];
            var billingInputs = [];

            if (self._domPanels.shipping) {
                shippingInputs = self._domPanels.shipping.querySelectorAll('input[type=text]');
                shippingInputs = Array.prototype.slice.call(shippingInputs);
            }
            if (self._domPanels.billing) {
                billingInputs = self._domPanels.billing.querySelectorAll('input[type=text]');
                billingInputs = Array.prototype.slice.call(billingInputs);
            }

            var inputs = shippingInputs.concat(billingInputs);

            for (var i = 0; i < inputs.length; i++) {
                inputs[i].addEventListener('keyup', self.updateAddresses.bind(self), false);
            }

        },
        onPreviousPanelClick: function(e) {
            e = e || window.event;
            e.preventDefault();

            if (self.isDescendant(self._domPanels.billing, e.target)) {
                self.previousPanel.notify(panels.billing.name);
            } else if (self.isDescendant(self._domPanels.card, e.target)) {
                self.previousPanel.notify(panels.card.name);
            }
        },
        updateAddresses: function(e) {
            var self = this;
            e = e || window.event;
            var blob = {};

            // get all address fields in panel
            if (self.isDescendant(self._domPanels.shipping, e.target)) {
                var inputs = self._domPanels.shipping.querySelectorAll('input[type=text]');
                for (var i = 0; i < inputs.length; i++) {
                    var key = inputs[i].getAttribute('name');
                    blob[key] = inputs[i].value;
                }
                self._model.setShippingAddress(blob);

                if (self._model.getAddressSync()) {
                    self._model.setBillingAddress(blob);
                }

            } else {
                var inputs = self._domPanels.billing.querySelectorAll('input[type=text]');
                for (var i = 0; i < inputs.length; i++) {
                    var key = inputs[i].getAttribute('name');
                    blob[key] = inputs[i].value;
                }
                self._model.setBillingAddress(blob);
            }
        },
        closeIframe: function() {
            var self = this;
            beanstream.Helper.fireEvent('beanstream_closePayform', {}, window.parent.document);
        },
        attachPayfieldsListeners: function() {
            var self = this;
            document.addEventListener('beanstream_loaded', this.addStylingToPayfields.bind(self));
            document.addEventListener('beanstream_tokenUpdated', this.onTokenUpdated.bind(self));
            document.addEventListener('beanstream_inputValidityChanged', this.onCardValidityChanged.bind(self));
        },
        isDescendant: function(parent, child) {
            var node = child.parentNode;
            while (node != null) {
                if (node == parent) {
                    return true;
                }
                node = node.parentNode;
            }

            return false;
        },
        onTokenUpdated: function() {
            var self = this;
            var blob = {};

            var token = document.getElementsByName('singleUseToken')[0].value;
            var name = self._domPanels.card.querySelector('input[name="name"]').value;
            blob.name = name;
            blob.code = token;

            self._model.setCardInfo(blob);
            self.tokenUpdated.notify();
        },
        onCardValidityChanged: function(e) {
            var self = this;
            self._model.setCardErrors(e.eventDetail);
            self.errorsUpdated.notify();
        },

        addStylingToPayfields: function() {
            var self = this;
            var cardPanel = document.getElementById('card_panel');
            var inputs = cardPanel.getElementsByTagName('input');

            // get placehokders - check if input is child
            // isDescendant

            var numberPlaceholder = document.querySelector('[data-beanstream-target="ccNumber_input"]');
            var cvvPlaceholder = document.querySelector('[data-beanstream-target="ccCvv_input"]');
            var expiryPlaceholder = document.querySelector('[data-beanstream-target="ccExp_input"]');

            for (var i = 0; i < inputs.length; i++) {
                inputs[i].classList.add('u-full-width');
                inputs[i].type = 'text';

                if (self.isDescendant(numberPlaceholder, inputs[i])) {
                    inputs[i].id = 'card_number';
                    inputs[i].placeholder = 'Card number';

                } else if (self.isDescendant(expiryPlaceholder, inputs[i])) {
                    inputs[i].id = 'card_expiry';
                    inputs[i].placeholder = 'Expiry MM/YY';
                } else if (self.isDescendant(cvvPlaceholder, inputs[i])) {
                    inputs[i].id = 'card_cvv';
                    inputs[i].placeholder = 'CVV';
                }
            }
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

        /**
         * Checks that no fields on current panel are empty
         *
         * @param {String} panel
         * @return {Boole} isValid
         */
        validateFields: function(panel) {
            console.log('* validateFields');
            var self = this;
            var isValid = true;
            var inputs = self._domPanels[panel].getElementsByTagName('input');

            for (var i = 0; i < inputs.length; i++) {
                // if input string length is not 0
                if (!inputs[i].value.length) {
                    isValid = false;
                    inputs[i].classList.add('beanstream_invalid');
                } else {
                    if (!inputs[i].hasAttribute('data-beanstream-id')) {
                        inputs[i].classList.remove('beanstream_invalid');
                    }
                }
            }

            self._model.setIsCurrentPanelValid(isValid);
            self.errorsUpdated.notify();
            return isValid;
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormView = FormView;
})(window);
