
(function(window) {
    'use strict';

    function FormTemplate() {
        var self = this;
        self.template = {};

        self.template.main =
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
