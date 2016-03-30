
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

                // If addresses are synced a click on 'shipping next' will mimic a click on 'billing next'
                if (panel  === self.panels.shipping.name && self._model.getAddressSync()) {
                    panel = self.panels.billing.name;
                }

                self.setCurrentPanel(self.panels[panel].next);
            }.bind(self));

            self._view.syncAddresses.attach(function(sender, sync) {

                self._model.setAddressSync(sync);
                self._view.render('navigationRelativeToAddressSync', { sync: sync, panels: self.panels });

                self._model.setBillingAddress(self._model.getShippingAddress());
                // toDo: add logic to listen for keyup's and update billing address if synced

            }.bind(self));

            self._view.submit.attach(function(sender, e) {
                console.log('Controller submit');

                var billing = self._model.getBillingAddress();
                var shipping = self._model.getShippingAddress();
                var token = self._model.getToken();

                console.log('billing: ' + billing);
                console.log('shipping: ' + shipping);
                console.log('token: ' + token);

                self._view.fireEvent('beanstream_Payform_complete', {});

                /*
                  "token": {
                    "name": "string",
                    "code": "string"
                  },
                  "billing": {
                    "name": "string",
                    "address_line1": "string",
                    "address_line2": "string",
                    "city": "string",
                    "province": "string",
                    "country": "string",
                    "postal_code": "string",
                    "phone_number": "string",
                    "email_address": "string"
                  },
                */


                self._view.closeIframe();

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

                panels[panelNames[i]] = { name: panelNames[i], previous: '', next: '' };

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
            name = name.replace(/[\[\]]/g, '\\$&').toLowerCase();// This is just to avoid case sensitiveness for query parameter name
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
            config.image = self.getParameterByName('data-image');
            config.name = self.getParameterByName('data-name');
            config.description = self.getParameterByName('data-description');
            config.amount = self.getParameterByName('data-amount');
            config.billing = self.getParameterByName('data-billingAddress');
            config.shipping = self.getParameterByName('data-shippingAddress');

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

            self._view.render('currentPanel', { old: self.currentPanel, new: panel, panels: self.panels });
            self.currentPanel = panel;
        }

    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.payform = window.beanstream.payform || {};
    window.beanstream.payform.FormController = FormController;
})(window);
