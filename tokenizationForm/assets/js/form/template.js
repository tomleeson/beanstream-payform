
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
                                '<img src="assets/css/images/ic_clear_white_24px.svg">' +
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
                    '<input class="u-full-width" type="text" placeholder="Name" data-id="name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<input class="u-full-width" type="text" placeholder="Street Address" data-id="address_line1">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="Zip" data-id="postal_code">' +
                '</div>' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="City" data-id="city">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="State" data-id="province">' +
                '</div>' +
                '<div class="six columns">' +
                    '<input class="u-full-width" type="text" placeholder="Country" data-id="country">' +
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
            template.card = template.card.replace('{{nextButtonType}}', 'submit');

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
