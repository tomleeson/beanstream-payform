
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
                            '<a id="close-button">' +
                                '<img src="https://s3-us-west-2.amazonaws.com/payform-staging/' +
                                    'payForm/tokenizationForm/images/ic_clear_white_24px.svg">' +
                            '</a>' +
                        '</div>' +
                        '<div class="container">' +
                            '<div class="circle" style="background-image: url({{image}})"></div>' +
                            // '<img src="{{image}}">' +
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
                '{{backButton}}' +
                '<div class="row heading">' +
                    '<div class="inner">' +
                        '<h6>{{panelName}}</h6>' +
                    '</div>' +
                '</div>' +
                '{{content}}' +
                '<div class="row error hidden"></div>' +
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
                    '<input class="u-full-width" type="text" placeholder="Name" name="name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<div data-beanstream-target="ccNumber_input"></div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<div data-beanstream-target="ccExp_input"></div>' +
                '</div>' +
                '<div class="six columns">' +
                    '<div data-beanstream-target="ccCvv_input"></div>' +
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

        self.template.backButton =
            '<div class="row back-button">' +
                '<div class="icon">' +
                    '<a>' +
                        '<img src="assets/css/images/ic_keyboard_arrow_left_white_24px.svg">' +
                        // '<img src="https://s3-us-west-2.amazonaws.com/payform-staging/' +
                        //        'payForm/tokenizationForm/images/ic_keyboard_arrow_left_white_24px.svg">' +
                    '</a>' +
                '</div>' +
                '<a><h6>{{backButtonLabel}}</h6></a>' +
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
                        template.shipping = template.shipping.replace('{{panelId}}', parameter.panels.shipping.name);
                        template.shipping = template.shipping.replace('{{panelName}}', 'Shippig Info');
                        template.shipping = template.shipping.replace('{{nextButtonLabel}}',
                                                parameter.panels.shipping.next + ' &gt;');
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
                        template.billing = template.billing.replace('{{panelId}}', parameter.panels.billing.name);
                        template.billing = template.billing.replace('{{panelName}}', 'Billing Info');
                        template.billing = template.billing.replace('{{nextButtonLabel}}',
                                                parameter.panels.billing.next + ' &gt;');
                        template.billing = template.billing.replace('{{nextButtonType}}', 'button');

                        if (parameter.config.shipping) {
                            template.billing = template.billing.replace('{{backButton}}', self.template.backButton);
                            template.billing = template.billing.replace('{{backButtonLabel}}',
                                                parameter.panels.billing.previous);
                        }
                    }

                    template.card = self.template.panel;
                    template.card = template.card.replace('{{content}}', self.template.card);
                    template.card = template.card.replace('{{panelId}}', parameter.panels.card.name);
                    template.card = template.card.replace('{{panelName}}', 'Card Info');
                    template.card = template.card.replace('{{nextButtonLabel}}', 'Pay $' + parameter.config.amount);
                    template.card = template.card.replace('{{nextButtonType}}', 'button');

                    if (parameter.config.billing || parameter.config.shipping) {
                        template.card = template.card.replace('{{backButton}}', self.template.backButton);
                        template.card = template.card.replace('{{backButtonLabel}}', parameter.panels.card.previous);
                    }

                    template.main = self.template.main;
                    template.main = template.main.replace('{{name}}', parameter.config.name);
                    template.main = template.main.replace('{{image}}', parameter.config.image);
                    template.main = template.main.replace('{{description}}', parameter.config.description);
                    template.main = template.main.replace('{{content}}',
                                        template.shipping + template.billing + template.card);
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
