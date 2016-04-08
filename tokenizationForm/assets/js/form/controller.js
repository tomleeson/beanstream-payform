
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
