
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function FormModel() {
        this._addressSync = true;
        this._billingAddress = {};
        this._shippingAddress = {};
        this._cardInfo = {};
        this._currentPanel = '';
        this._isValid = false;
        this._cardErrors = [];
    }

    FormModel.prototype = {
        getAddressSync: function() {
            return this._addressSync;
        },
        setAddressSync: function(value) {
            if (value != this._addressSync) {
                this._addressSync = value;
            }
        },
        getShippingAddress: function() {
            return this._shippingAddress;
        },
        setShippingAddress: function(value) {
            if (value != this._shippingAddress) {
                this._shippingAddress = value;
            }
        },
        getBillingAddress: function() {
            return this._billingAddress;
        },
        setBillingAddress: function(value) {
            if (value != this._billingAddress) {
                this._billingAddress = value;
            }
        },
        getCardInfo: function() {
            return this._cardInfo;
        },
        setCardInfo: function(value) {
            if (value != this._cardInfo) {
                this._cardInfo = value;
            }
        },
        getCurrentPanel: function() {
            return this._currentPanel;
        },
        setCurrentPanel: function(value) {
            if (value != this._currentPanel) {
                this._currentPanel = value;
            }
        },
        getIsCurrentPanelValid: function() {
            return this._isValid;
        },
        setIsCurrentPanelValid: function(value) {
            if (value != this._isValid) {
                this._isValid = value;
            }
        },
        getCardErrors: function() {
            return this._cardErrors;
        },
        setCardErrors: function(value) {
            // Remove previous error for field
            var cardErrors = this._cardErrors.filter(function(f) {
                return f.fieldType != value.fieldType;
            });

            // only add error message if field invalid
            if (value.isValid != true) {
                cardErrors.push(value);
            }
            this._cardErrors = cardErrors;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormModel = FormModel;
})(window);

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
            self.panels = panels;

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
                            beanstream.Helper.toSentenceCase(parameter.panels.billing.next) + ' Details';
                        cardBackButton.innerHTML = '<h6>' +
                            beanstream.Helper.toSentenceCase(parameter.panels.billing.previous) + ' Details</h6>';
                    } else {
                        shippingNextButton.childNodes[0].childNodes[0].innerHTML =
                            beanstream.Helper.toSentenceCase(parameter.panels.shipping.next) + ' Details';
                        cardBackButton.innerHTML = '<h6>' +
                            beanstream.Helper.toSentenceCase(parameter.panels.card.previous) + ' Details</h6>';
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
            var self = this;

            if (self.isDescendant(self._domPanels.billing, e.target)) {
                self.previousPanel.notify(self.panels.billing.name);
            } else if (self.isDescendant(self._domPanels.card, e.target)) {
                self.previousPanel.notify(self.panels.card.name);
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
                    inputs[i].classList.add('no-border-right');
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

(function(window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function FormController(model, view) {
        var self = this;
        self._model = model;
        self._view = view;
    }

    FormController.prototype = {

        init: function() {
            var self = this;
            self.config = self.getConfig();
            self.panels = self.setPanelFlow(self.config);
            self._view.init(self.config, self.panels);

            self.setCurrentPanel();

            self._view.nextPanel.attach(function(sender, panel) {

                // Do not move to next panel if fields not valid
                if (!self._view.validateFields(panel)) {
                    return;
                }

                // If addresses are synced a click on 'shipping next' will mimic a click on 'billing next'
                if (panel  === self.panels.shipping.name && self._model.getAddressSync()) {
                    panel = self.panels.billing.name;
                }

                self.setCurrentPanel(self.panels[panel].next);
            }.bind(self));

            self._view.previousPanel.attach(function(sender, panel) {

                // If addresses are synced a click on 'card previous' will mimic a click on 'billing previous'
                if (panel  === self.panels.card.name && self._model.getAddressSync()) {
                    panel = self.panels.billing.name;
                }

                self.setCurrentPanel(self.panels[panel].previous);
            }.bind(self));

            self._view.syncAddresses.attach(function(sender, sync) {

                self._model.setAddressSync(sync);
                self._view.render('navigationRelativeToAddressSync', {sync: sync, panels: self.panels});

                self._model.setBillingAddress(self._model.getShippingAddress());

            }.bind(self));

            self._view.tokenUpdated.attach(function(sender, e) {
                var data = {};
                data.cardInfo = self._model.getCardInfo();
                data.billingAddress = self._model.getBillingAddress();
                data.shippingAddress = self._model.getShippingAddress();

                beanstream.Helper.fireEvent('beanstream_Payform_complete', data, window.parent.document);

                self._view.closeIframe();

            }.bind(self));

            self._view.tokenize.attach(function(sender, e) {
                console.log('* tokenize');
                if (!self._view.validateFields('card')) {
                    return;
                }

                beanstream.Helper.fireEvent('beanstream_tokenize', {}, self._view.form);

            }.bind(self));

            self._view.errorsUpdated.attach(function(sender, e) {
                console.log('errorsUpdated');

                var cardErrors = self._model.getCardErrors();
                var isValid = self._model.getIsCurrentPanelValid();

                var errorMessages = [];
                if (!isValid) {
                    errorMessages.push('Please fill all fields.');
                }

                if (cardErrors.length) {;
                    for (var i = 0; i < cardErrors.length; i++) {
                        // This is a required field.
                        if ((cardErrors[i].error === 'Please enter a CVV number.' ||
                            cardErrors[i].error === 'Please enter an expiry date.' ||
                            cardErrors[i].error === 'Please enter a credit card number.')) {

                            if (errorMessages.indexOf('Please fill all fields.') === -1) {
                                errorMessages.push('Please fill all fields.');
                            }
                        } else {
                            errorMessages.push(cardErrors[i].error);
                        }
                    }
                }

                self._view.render('errorBlock', {errorMessages: errorMessages, panel: self._model.getCurrentPanel()});
            }.bind(self));
        },

        /**
        * Adds panel names to array in sequence thy will appear
        */
        setPanelFlow: function(config) {
            var panelNames = [];
            var panels = {};

            if (config.shipping) {
                panelNames.push('shipping');
            }
            if (config.billing) {
                panelNames.push('billing');
            }
            panelNames.push('card');

            for (var i = 0; i < panelNames.length; i++) {

                panels[panelNames[i]] = {name: panelNames[i], previous: '', next: ''};

                if (i - 1 >= 0) {
                    panels[panelNames[i]].previous = panelNames[i - 1];
                }
                if (i + 1 < panelNames.length) {
                    panels[panelNames[i]].next = panelNames[i + 1];
                }
            }

            return panels;
        },

        getParameterByName: function(name, url) {
            // source: http://stackoverflow.com/a/901144
            if (!url) {
                url = window.location.href;
            }
            url = url.toLowerCase(); // This is just to avoid case sensitiveness
            // This is just to avoid case sensitiveness for query parameter name
            name = name.replace(/[\[\]]/g, '\\$&').toLowerCase();
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
            var results = regex.exec(url);
            if (!results) {
                return null;
            }
            if (!results[2]) {
                return '';
            }
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },

        getConfig: function() {
            var self = this;
            var config = {};
            config.image = self.getParameterByName('image');
            config.name = self.getParameterByName('name');
            config.description = self.getParameterByName('description');
            config.amount = self.getParameterByName('amount');
            config.billing = self.getParameterByName('billingAddress');
            config.shipping = self.getParameterByName('shippingAddress');
            config.currency = self.getParameterByName('currency');

            return config;
        },

        setCurrentPanel: function(panel) {
            var self = this;

            // 'panel' parameter not defined on initial call. set initil panel according to flow
            if (!panel) {
                if (self.panels.shipping) {
                    panel = self.panels.shipping.name;
                } else if (self.panels.billing) {
                    panel = self.panels.billing.name;
                } else {
                    panel = self.panels.card.name;
                }
            }

            self._view.render('currentPanel', {old: self._model.getCurrentPanel(), new: panel, panels: self.panels});
            self._model.setCurrentPanel(panel);
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormController = FormController;
})(window);

(function(window) {
    'use strict';

    function FormTemplate() {
        var self = this;
        self.template = {};

        self.template.main =
            '<div class="vertical-center">' +
            '<div class="wrapper">' +
                '<form>' +
                    '<div class="row heading main-heading drop-shaddow">' +
                        '<div class="icon">' +
                            '<a id="close-button" href="javascript:void(0)">' +
                                '<img src="assets/css/images/ic_clear_white_24px.svg">' +
                            '</a>' +
                        '</div>' +
                        '<div class="container main">' +
                            '<div class="circle" style="background-image: url({{image}})"></div>' +
                            '<div>' +
                                '<h5>{{name}}</h5>' +
                                '<p>{{currencySign}} {{amount}} {{currency}}</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="container sub">' +
                            '<span>{{description}}</span>' +
                        '</div>' +
                    '</div>' +
                    '{{content}}' +
                '</form>' +
                '<div class="footer">' +
                    '<a href="http://www.beanstream.com" target="_blank">' +
                        '<span>secured by</span>' +
                        '<img src="assets/css/images/beanstream_logo.png">' +
                    '</a>' +
                '</div>' +
            '</div>' +
            '</div>';

        self.template.panel =
            '<div class="container hidden" id="{{panelId}}_panel">' +
                '{{backButton}}' +
                '<div class="row heading section-heading">' +
                    '<div class="inner">' +
                        '<h6>{{panelName}}</h6>' +
                    '</div>' +
                '</div>' +
                '{{content}}' +
                '<div class="row error hidden"></div>' +
                '<button type="{{nextButtonType}}" class="button">' +
                    '{{nextButtonLabel}}' +
                '</button>' +
            '</div>';

        self.template.card =
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_email" class="hidden">Email</label>' +
                    '<input class="u-full-width" type="text" placeholder="Email" name="email" id="{{panelId}}_email">' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_name" class="hidden">Name</label>' +
                    '<input class="u-full-width" type="text" placeholder="Name" name="name" id="{{panelId}}_name">' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_number" class="hidden">Credit card number</label>' +
                    '<div data-beanstream-target="ccNumber_input" id="{{panelId}}_number"></div>' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_expiry" class="hidden">Expiry MM/YY</label>' +
                    '<div data-beanstream-target="ccExp_input" id="{{panelId}}_expiry"></div>' +
                '</div>' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_cvv" class="hidden">CVV</label>' +
                    '<div data-beanstream-target="ccCvv_input" id="{{panelId}}_cvv"></div>' +
                '</div>' +
            '</div>';

        self.template.address =
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_name" class="hidden">Name</label>' +
                    '<input class="u-full-width" type="text" placeholder="Name" name="name" id="{{panelId}}_name">' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_address_line1" class="hidden">Street Address</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="Street Address" name="address_line1" id="{{panelId}}_address_line1">' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_postal_code" class="hidden">Postal Code</label>' +
                    '<input class="u-full-width no-border-right" type="text"' +
                        'placeholder="Zip" name="postal_code" id="{{panelId}}_postal_code">' +
                '</div>' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_city" class="hidden">City</label>' +
                    '<input class="u-full-width" type="text" placeholder="City" name="city" id="{{panelId}}_city">' +
                '</div>' +
            '</div>' +
            '<div class="row no-top-border">' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_province" class="hidden">Province</label>' +
                    '<input class="u-full-width no-border-right" type="text"' +
                        'placeholder="State" name="province" id="{{panelId}}_province">' +
                '</div>' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_country" class="hidden">Country</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="Country" name="country" id="{{panelId}}_country">' +
                '</div>' +
            '</div>' +
            '{{checkbox}}';

        self.template.syncAddressesCheckbox =
            '<div class="row">' +
                '<label class="checkbox">' +
                    '<input type="checkbox" checked>' +
                    '<span class="label-body">My billing address is the same as my shipping address</span>' +
                '</label>' +
            '</div>';

        self.template.backButton =
            '<div class="row back-button">' +
                '<div class="icon">' +
                    '<a>' +
                        '<img src="assets/css/images/ic_keyboard_arrow_left_white_24px.svg">' +
                    '</a>' +
                '</div>' +
                '<a href="javascript:void(0)"><h6>{{backButtonLabel}}</h6></a>' +
            '</div>';

        self.template.errorList =
            '<ul>' +
                '{{errorListContent}}' +
            '</ul>';

        self.template.errorListItem =
            '<li>' +
                '{{errorItem}}' +
            '</li>';

    }

    FormTemplate.prototype = {

        show: function(templateCmd, parameter) {
            var self = this;

            var templateCommands = {
                elements: function() {
                    // parameter.config , parameter.panels

                    var template = {};
                    template.shipping = '';
                    template.billing = '';

                    if (parameter.config.shipping) {
                        template.shipping = self.template.panel;
                        template.shipping = template.shipping.replace('{{content}}', self.template.address);
                        template.shipping = template.shipping.replace(/{{panelId}}/gi, parameter.panels.shipping.name);
                        template.shipping = template.shipping.replace('{{panelName}}', 'Shipping Details');
                        template.shipping = template.shipping.replace('{{nextButtonLabel}}',
                            '<div class="label-outter"><div class="label-inner">{{nextButtonLabel}}</div></div>');
                        template.shipping = template.shipping.replace('{{nextButtonLabel}}',
                            beanstream.Helper.toSentenceCase(parameter.panels.shipping.next) + ' Details');
                        template.shipping = template.shipping.replace('{{nextButtonType}}', 'button');
                        template.shipping = template.shipping.replace('{{backButton}}', '');

                        if (parameter.config.billing) {
                            template.shipping = template.shipping.replace('{{checkbox}}',
                                                    self.template.syncAddressesCheckbox);
                        } else {
                            template.shipping = template.shipping.replace('{{checkbox}}', '');
                        }
                    }
                    if (parameter.config.billing) {
                        template.billing = self.template.panel;
                        template.billing = template.billing.replace('{{content}}', self.template.address);
                        template.billing = template.billing.replace('{{checkbox}}', '');
                        template.billing = template.billing.replace(/{{panelId}}/gi, parameter.panels.billing.name);
                        template.billing = template.billing.replace('{{panelName}}', 'Billing Details');
                        template.billing = template.billing.replace('{{nextButtonLabel}}',
                            '<div class="label-outter"><div class="label-inner">{{nextButtonLabel}}</div></div>');
                        template.billing = template.billing.replace('{{nextButtonLabel}}',
                            beanstream.Helper.toSentenceCase(parameter.panels.billing.next) + ' Details');
                        template.billing = template.billing.replace('{{nextButtonType}}', 'button');

                        if (parameter.config.shipping) {
                            template.billing = template.billing.replace('{{backButton}}', self.template.backButton);
                            template.billing = template.billing.replace('{{backButtonLabel}}',
                                beanstream.Helper.toSentenceCase(parameter.panels.billing.previous) + ' Details');
                        }
                    }

                    template.card = self.template.panel;
                    template.card = template.card.replace('{{content}}', self.template.card);
                    template.card = template.card.replace(/{{panelId}}/gi, parameter.panels.card.name);
                    template.card = template.card.replace('{{panelName}}', 'Card Details');
                    template.card = template.card.replace('{{nextButtonLabel}}', 'Pay');
                    template.card = template.card.replace('{{nextButtonType}}', 'button');

                    if (parameter.config.billing || parameter.config.shipping) {
                        template.card = template.card.replace('{{backButton}}', self.template.backButton);
                        template.card = template.card.replace('{{backButtonLabel}}',
                            beanstream.Helper.toSentenceCase(parameter.panels.card.previous) + ' Details');
                    }

                    template.main = self.template.main;
                    template.main = template.main.replace('{{name}}', parameter.config.name);
                    template.main = template.main.replace('{{image}}', parameter.config.image);
                    template.main = template.main.replace('{{amount}}', parameter.config.amount);
                    template.main = template.main.replace('{{currency}}', parameter.config.currency.toUpperCase());
                    template.main = template.main.replace('{{description}}', parameter.config.description);
                    template.main = template.main.replace('{{content}}',
                                        template.shipping + template.billing + template.card);

                    var currencySign = '';
                    switch (parameter.config.currency.toUpperCase()) {
                        case 'CAD':
                        case 'USD':
                            currencySign = '$';
                            break;
                        case 'GBP':
                            currencySign = '£';
                            break;
                        case 'EUR':
                            currencySign = '€';
                            break;
                        default:
                            currencySign = '$';
                    }
                    template.main = template.main.replace('{{currencySign}}', currencySign);

                    template = template.main;

                    return template;

                },
                errors: function() {
                    // parameter.errorMessages

                    var template = self.template.errorList;
                    var errorList = '';

                    for (var i = 0; i < parameter.errorMessages.length; i++) {
                        errorList = errorList + self.template.errorListItem;
                        errorList = errorList.replace('{{errorItem}}', parameter.errorMessages[i]);
                    }

                    template = template.replace('{{errorListContent}}', errorList);
                    return template;
                }
            };

            return templateCommands[templateCmd]();
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormTemplate = FormTemplate;
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

        return {
            isNonInputKey: isNonInputKey,
            createDocFrag: createDocFrag,
            isEmpty: isEmpty,
            fireEvent: fireEvent,
            toSentenceCase: toSentenceCase
        };
    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Helper = Helper;
})(window);

(function() {

    console.log('Starting Beanstream Payform: Tokenization...');

    var form = {};
    form.model = new beanstream.payform.FormModel();
    form.template = new beanstream.payform.FormTemplate();
    form.view = new beanstream.payform.FormView(form.model, form.template);
    form.controller = new beanstream.payform.FormController(form.model, form.view);

    form.controller.init();

})();
