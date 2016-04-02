
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
        this.syncAddresses = new beanstream.Event(this);
        this.tokenUpdated = new beanstream.Event(this);
        this.tokenize = new beanstream.Event(this);
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
                    var template = self._template.show(parameter.config, parameter.panels);
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

                    self._domPanels[parameter.new].className =
                        self._domPanels[parameter.new].classList.remove('hidden');
                    if (parameter.old) {
                        self._domPanels[parameter.old].classList.add('hidden');

                    }
                },
                navigationRelativeToAddressSync: function() {
                    // parameter.panels, parameter.sync

                    var button = self._domPanels.shipping.getElementsByTagName('button')[0];
                    if (parameter.sync) {
                        button.innerHTML = parameter.panels.billing.next + ' &gt;';
                    } else {
                        button.innerHTML = parameter.panels.shipping.next + ' &gt;';
                    }

                    // toDo: update previous button on card panel

                }
            };

            viewCommands[viewCmd]();
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
                var button = self._domPanels.shipping.getElementsByTagName('button')[0];
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e = e || window.event;
                    self.nextPanel.notify(panels.shipping.name);
                }.bind(self), false);
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

            var closeButton = document.getElementsByTagName('a')[0];
            closeButton.addEventListener('click', function(e) {
                var self = this;
                e.preventDefault();
                e = e || window.event;
                self.closeIframe();
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
            self.fireEventToParent('beanstream_closePayform');
        },
        fireEvent: function(title, eventDetail, element = document) {
            var event = new CustomEvent(title);
            event.eventDetail = eventDetail;
            element.dispatchEvent(event);
        },
        fireEventToParent: function(title, eventDetail) {
            var event = new CustomEvent(title);
            event.eventDetail = eventDetail;
            if (window.parent) {
                window.parent.document.dispatchEvent(event);
            }
        },
        attachPayfieldsListeners: function() {
            var self = this;
            document.addEventListener('beanstream_loaded', this.addStylingToPayfields);
            document.addEventListener('beanstream_tokenUpdated', this.onTokenUpdated.bind(self));
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

        addStylingToPayfields: function() {
            var cardPanel = document.getElementById('card_panel');
            var inputs = cardPanel.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].classList.add('u-full-width');
                inputs[i].type = 'text';
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
        validateFields: function(panel) {
            var self = this;
            var valid = true;
            var inputs = self._domPanels[panel].getElementsByTagName('input');

            for (var i = 0; i < inputs.length; i++) {
                // if input string length is not 0
                if (inputs[i].value.length) {
                    inputs[i].classList.remove('beanstream_invalid');
                } else {
                    valid = false;
                    if (!inputs[i].classList.contains('beanstream_invalid')) {
                        inputs[i].classList.add('beanstream_invalid');
                    }
                }
            }

            if (panel === 'card') {
                var inputs = Array.prototype.slice.call(inputs);
                var name = inputs.filter(function(c) {
                    return c.name === 'name';
                });
                name = name[0];

                var email = inputs.filter(function(c) {
                    return c.name === 'email';
                });
                email = email[0];

                // let payfields validate its own fields
                if (name.value.length && email.value.length) {
                    valid = true;
                }
            }
            return valid;
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

            self._view.syncAddresses.attach(function(sender, sync) {

                self._model.setAddressSync(sync);
                self._view.render('navigationRelativeToAddressSync', {sync: sync, panels: self.panels});

                self._model.setBillingAddress(self._model.getShippingAddress());
                // toDo: add logic to listen for keyup's and update billing address if synced

            }.bind(self));

            self._view.tokenUpdated.attach(function(sender, e) {
                var data = {};
                data.cardInfo = self._model.getCardInfo();
                data.billingAddress = self._model.getBillingAddress();
                data.shippingAddress = self._model.getShippingAddress();

                self._view.fireEventToParent('beanstream_Payform_complete', data);

                self._view.closeIframe();

            }.bind(self));

            self._view.tokenize.attach(function(sender, e) {
                if (!self._view.validateFields('card')) {
                    return;
                }

                self._view.fireEvent('beanstream_tokenize', {}, self._view.form);

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

            return config;
        },

        setCurrentPanel: function(panel) {
            var self = this;

            // toDo: add validation. only allow progression if fields complete

            if (!self.currentPanel) {
                self.currentPanel = '';
            }

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

            self._view.render('currentPanel', {old: self.currentPanel, new: panel, panels: self.panels});
            self.currentPanel = panel;
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
            '<div class="wrapper">' +
                '<form>' +
                    '<div class="row heading main-heading">' +
                        '<div class="icon">' +
                            '<a>' +
                                // '<img src="assets/css/images/ic_clear_white_24px.svg">' +
                                '<img src="https://s3-us-west-2.amazonaws.com/payform-staging/' +
                                    'payForm/tokenizationForm/images/ic_clear_white_24px.svg">' +
                            '</a>' +
                        '</div>' +
                        '<div class="container">' +
                            '<div class="circle"></div>' +
                            '<div>' +
                                '<h5>{{name}}</h5>' +
                                '<p>{{description}}</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '{{content}}' +
                '</form>' +
            '</div>';

        self.template.panel =
            '<div class="container hidden" id="{{panelId}}_panel">' +

                '<div class="row heading">' +
                    '<div class="container">' +
                        '<h6>{{panelName}}</h6>' +
                    '</div>' +
                '</div>' +
                '{{content}}' +
                '<button type="{{nextButtonType}}">{{nextButtonLabel}}</button>' +
            '</div>';

        self.template.card =
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<input class="u-full-width" type="text" placeholder="Email" name="email">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<input class="u-full-width" type="text" placeholder="Cardholder&#39;s name" name="name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<div data-beanstream-target="ccNumber_input"></div>' +
                    '<div data-beanstream-target="ccNumber_error" class="help-block"></div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<div data-beanstream-target="ccExp_input"></div>' +
                    '<div data-beanstream-target="ccExp_error" class="help-block"></div>' +
                '</div>' +
                '<div class="six columns">' +
                    '<div data-beanstream-target="ccCvv_input"></div>' +
                    '<div data-beanstream-target="ccCvv_error" class="help-block"></div>' +
                '</div>' +
            '</div>';

        self.template.address =
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<input class="u-full-width" type="text" placeholder="Name" name="name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<input class="u-full-width" type="text" placeholder="Street Address" name="address_line1">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="Zip" name="postal_code">' +
                '</div>' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="City" name="city">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="State" name="province">' +
                '</div>' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="Country" name="country">' +
                '</div>' +
            '</div>' +
            '{{checkbox}}';

        self.template.syncAddressesCheckbox =
            '<div class="row">' +
                '<label class="example-send-yourself-copy">' +
                    '<input type="checkbox" checked>' +
                    '<span class="label-body">Billing address is same as shipping address</span>' +
                '</label>' +
            '</div>';

    }

    FormTemplate.prototype = {

        show: function(config, panels) {
            var self = this;
            var template = {};
            template.shipping = '';
            template.billing = '';

            if (config.shipping) {
                template.shipping = self.template.panel;
                template.shipping = template.shipping.replace('{{content}}', self.template.address);
                template.shipping = template.shipping.replace('{{panelId}}', panels.shipping.name);
                template.shipping = template.shipping.replace('{{panelName}}', 'Shippig Info');
                template.shipping = template.shipping.replace('{{nextButtonLabel}}', panels.shipping.next + ' &gt;');
                template.shipping = template.shipping.replace('{{nextButtonType}}', 'button');

                if (config.billing) {
                    template.shipping = template.shipping.replace('{{checkbox}}', self.template.syncAddressesCheckbox);
                } else {
                    template.shipping = template.shipping.replace('{{checkbox}}', '');
                }
            }
            if (config.billing) {
                template.billing = self.template.panel;
                template.billing = template.billing.replace('{{content}}', self.template.address);
                template.billing = template.billing.replace('{{checkbox}}', '');
                template.billing = template.billing.replace('{{panelId}}', panels.billing.name);
                template.billing = template.billing.replace('{{panelName}}', 'Billing Info');
                template.billing = template.billing.replace('{{nextButtonLabel}}', panels.billing.next + ' &gt;');
                template.billing = template.billing.replace('{{nextButtonType}}', 'button');
            }

            template.card = self.template.panel;
            template.card = template.card.replace('{{content}}', self.template.card);
            template.card = template.card.replace('{{panelId}}', panels.card.name);
            template.card = template.card.replace('{{panelName}}', 'Card Info');
            template.card = template.card.replace('{{nextButtonLabel}}', 'Pay $' + config.amount);
            template.card = template.card.replace('{{nextButtonType}}', 'button');

            template.main = self.template.main;
            template.main = template.main.replace('{{name}}', config.name);
            template.main = template.main.replace('{{description}}', config.description);
            template.main = template.main.replace('{{content}}', template.shipping + template.billing + template.card);
            template = template.main;

            return template;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormTemplate = FormTemplate;
})(window);

(function(window) {
    'use strict';

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

    console.log('Starting Beanstream Payform: Tokenization...');

    var form = {};
    form.model = new beanstream.payform.FormModel();
    form.template = new beanstream.payform.FormTemplate();
    form.view = new beanstream.payform.FormView(form.model, form.template);
    form.controller = new beanstream.payform.FormController(form.model, form.view);

    form.controller.init();

})();
