
(function(window) {
    'use strict';

    function FormTemplate() {
        var self = this;
        self.template = {};

        self.template.main =
            '<div class="vertical-center">' +
                '<div class="wrapper">' +
                    '<div id="main">' +
                        '<div class="row heading main-heading drop-shaddow">' +
                            '<div class="icon">' +
                                '<a id="close-button" href="javascript:void(0)">' +
                                    '<img src="css/images/ic_clear_white_24px.svg">' +
                                '</a>' +
                            '</div>' +
                            '<div class="container main">' +
                                '<div class="circle" style="background-image: url({{image}})"></div>' +
                                '<div>' +
                                    '<h5 class="truncate">{{name}}</h5>' +
                                    '<p>{{currencySign}} {{amount}} ' +
                                        '<span class="currency truncate">{{currency}}</span></p>' +
                                '</div>' +
                            '</div>' +
                            '<div class="container sub">' +
                                '<span class="description truncate">{{description}}</span>' +
                            '</div>' +
                        '</div>' +
                        '<form>' +
                            '{{content}}' +
                        '</form>' +
                        '<div class="footer">' +
                            '<img src="css/images/beanstream_logo.png">' +
                        '</div>' +
                    '</div>' +
                    '{{processingPanel}}' +
                '</div>' +
            '</div>';

        self.template.panel =
            '<div class="container panel-content hidden" id="{{panelId}}_panel">' +
                '{{backButton}}' +
                '{{panelHeader}}' +
                '{{content}}' +
                '<div class="row promptWrapper">' +
                    '<div class="hidden" id="cvcPrompt"></div>' +
                    '<div class="error hidden"></div>' +
                '</div>' +
                '<button type="{{nextButtonType}}" class="button">' +
                    '{{nextButtonLabel}}' +
                '</button>' +
            '</div>';

        self.template.card =
            '<div class="row email">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_email" class="hidden">Email</label>' +
                    '<input class="u-full-width" type="text" placeholder="email" name="email" id="{{panelId}}_email">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_name" class="hidden">Name</label>' +
                    '<input class="u-full-width" type="text" placeholder="name" name="name" id="{{panelId}}_name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_number" class="hidden">Credit card number</label>' +
                    '<div data-beanstream-target="ccNumber_input" id="{{panelId}}_number"' +
                        'class="no-top-border"></div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_expiry" class="hidden">Expiry MM/YYYY</label>' +
                    '<div data-beanstream-target="ccExp_input" id="{{panelId}}_expiry"' +
                        'class="no-right-border no-top-border"></div>' +
                '</div>' +
                '<div class="six columns">' +
                    '<label for="{{panelId}}_cvv" class="hidden">CVV</label>' +
                    '<div data-beanstream-target="ccCvv_input" id="{{panelId}}_cvv" class="no-top-border"></div>' +
                '</div>' +
            '</div>';

        self.template.address =
            '<div class="row">' +
                '<div class="twelve columns">' +
                    '<label for="{{panelId}}_name" class="hidden">Name</label>' +
                    '<input class="u-full-width" type="text" placeholder="name" name="name" id="{{panelId}}_name">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="twelve columns no-top-border">' +
                    '<label for="{{panelId}}_address_line1" class="hidden">Street Address</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="street address" name="address_line1" id="{{panelId}}_address_line1">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns no-right-border no-top-border">' +
                    '<label for="{{panelId}}_postal_code" class="hidden">Postal Code</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="zip" name="postal_code" id="{{panelId}}_postal_code">' +
                '</div>' +
                '<div class="six columns no-top-border">' +
                    '<label for="{{panelId}}_city" class="hidden">City</label>' +
                    '<input class="u-full-width" type="text" placeholder="city" name="city" id="{{panelId}}_city">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="six columns no-right-border no-top-border">' +
                    '<label for="{{panelId}}_province" class="hidden">{{province}}</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="{{province}}" name="province" id="{{panelId}}_province">' +
                '</div>' +
                '<div class="six columns no-top-border">' +
                    '<label for="{{panelId}}_country" class="hidden">Country</label>' +
                    '<input class="u-full-width" type="text"' +
                        'placeholder="country" name="country" id="{{panelId}}_country">' +
                '</div>' +
            '</div>' +
            '{{checkbox}}';

        self.template.syncAddressesCheckbox =
            '<div class="row">' +
                '<label class="checkbox">' +
                    '<input type="checkbox" checked>' +
                    '<span class="label-body">Billing address is same as shipping</span>' +
                '</label>' +
            '</div>';

        self.template.backButton =
            '<div class="row back-button">' +
                '<div class="icon">' +
                    '<a>' +
                        '<img src="css/images/ic_keyboard_arrow_left_white_24px.svg">' +
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

        self.template.panelHeader =
            '<div class="row heading section-heading">' +
                '<div class="inner">' +
                    '<h6>{{panelName}}</h6>' +
                '</div>' +
            '</div>';

        self.template.css = '.heading {background: {{primaryColor}};}' +
                            '.section-heading h6{color: {{primaryColor}};}' +
                            'button.button{ border-color: {{primaryColor}}; color: {{primaryColor}};' +
                            'position: relative; overflow: hidden; transition-duration: 0.4s; padding-left: 0;' +
                            'padding-right: 0; position: relative;}' +
                            'button.button:hover{ border-color: {{primaryColor}}; color: #fff; background-color:' +
                            '{{primaryColor}};}' +
                            'button.button:focus {border-color: {{primaryColor}}; color: {{primaryColor}};' +
                            'background-color: #fff; outline: 0;' +
                            'box-shadow: inset 0 1px 1px rgba(33,150,243,.075),0 0 8px rgba(33,150,243,.6);}' +
                            'button.button:active {background-color: {{primaryColor}}; color: #fff;}' +
                            '@-webkit-keyframes colors {' +
                            '0% {stroke: {{primaryColor}};}' +
                            '25% {stroke: {{primaryColor}};}' +
                            '50% {stroke: {{primaryColor}};}' +
                            '75% {stroke: {{primaryColor}};}' +
                            '100% {stroke: {{primaryColor}};}}' +
                            '@keyframes colors {' +
                            '0% {stroke: {{primaryColor}};}' +
                            '25% {stroke: {{primaryColor}};}' +
                            '50% {stroke: {{primaryColor}};}' +
                            '75% {stroke: {{primaryColor}};}' +
                            '100% {stroke: {{primaryColor}};}}' +
                            '#processing h1, h3{color: {{primaryColor}};}';

        self.template.processing =
            '<div class="hidden" id="processing">' +
                '<div>' +
                    '<div class="main">' +
                        '<h3>processing</h3>' +
                        '<h1>{{amount}}</h1>' +
                        '<div class="spinner-wrapper">' +
                        '<svg class="spinner" width="100%" height="100%" viewBox="0 0 66 66"' +
                            'xmlns="http://www.w3.org/2000/svg">' +
                            '<circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33"' +
                            'cy="33" r="30"></circle>' +
                        '</svg>' +
                        '</div>' +
                        '<h3>payment</h3>' +
                    '</div>' +
                    '<div class="content-footer">' +
                        '<img src="css/images/ic_verified_user_white_24px.svg"></img>' +
                        '<p>secured by beanstream</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
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

                    var currencySign = '';
                    var province = '';
                    switch (parameter.config.currency.toUpperCase()) {
                        case 'CAD':
                            currencySign = '$';
                            province = 'province';
                            break;
                        case 'USD':
                            currencySign = '$';
                            province = 'state';
                            break;
                        case 'GBP':
                            currencySign = '£';
                            province = 'county';
                            break;
                        case 'EUR':
                            currencySign = '€';
                            province = 'province';
                            break;
                        default:
                            currencySign = '$';
                            province = 'province';
                    }

                    if (parameter.config.shipping) {
                        template.shipping = self.template.panel;
                        template.shipping = template.shipping.replace('{{content}}', self.template.address);
                        template.shipping = template.shipping.replace(/{{panelId}}/gi, parameter.panels.shipping.name);
                        template.shipping = template.shipping.replace('{{panelHeader}}', self.template.panelHeader);
                        template.shipping = template.shipping.replace('{{panelName}}', 'Shipping Address');
                        // template.shipping = template.shipping.replace('{{nextButtonLabel}}',
                        //    '<div class="label-outter"><div class="label-inner">{{nextButtonLabel}}</div></div>');
                        template.shipping = template.shipping.replace('{{nextButtonType}}', 'button');
                        template.shipping = template.shipping.replace('{{backButton}}', '');
                        template.shipping = template.shipping.replace(/{{province}}/gi, province);

                        if (parameter.panels.shipping.next.toUpperCase() === 'BILLING') {
                            template.shipping = template.shipping.replace('{{nextButtonLabel}}',
                                'Billing Address &#62;');
                        } else {
                            template.shipping = template.shipping.replace('{{nextButtonLabel}}', 'Pay &#62;');
                        }
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
                        template.billing = template.billing.replace('{{panelHeader}}', self.template.panelHeader);
                        template.billing = template.billing.replace('{{panelName}}', 'Billing Address');
                        // template.billing = template.billing.replace('{{nextButtonLabel}}',
                        //    '<div class="label-outter"><div class="label-inner">{{nextButtonLabel}}</div></div>');
                        template.billing = template.billing.replace('{{nextButtonLabel}}', 'Pay &#62;');
                        template.billing = template.billing.replace('{{nextButtonType}}', 'button');
                        template.billing = template.billing.replace(/{{province}}/gi, province);

                        if (parameter.config.shipping) {
                            template.billing = template.billing.replace('{{backButton}}', self.template.backButton);
                            template.billing = template.billing.replace('{{backButtonLabel}}',
                                beanstream.Helper.toSentenceCase(parameter.panels.billing.previous) + ' Address');
                        } else {
                            template.billing = template.billing.replace('{{backButton}}', '');
                        }
                    }

                    template.card = self.template.panel;
                    template.card = template.card.replace('{{content}}', self.template.card);
                    template.card = template.card.replace(/{{panelId}}/gi, parameter.panels.card.name);
                    template.card = template.card.replace('{{panelHeader}}', '');
                    template.card = template.card.replace('{{nextButtonLabel}}', 'Pay ' +
                        currencySign + parameter.config.amount);
                    template.card = template.card.replace('{{nextButtonType}}', 'button');

                    if (parameter.config.billing || parameter.config.shipping) {
                        template.card = template.card.replace('{{backButton}}', self.template.backButton);
                        template.card = template.card.replace('{{backButtonLabel}}',
                            beanstream.Helper.toSentenceCase(parameter.panels.card.previous) + ' Address');
                    } else {
                        template.card = template.card.replace('{{backButton}}', '');
                    }

                    template.processing = self.template.processing;
                    template.processing = template.processing.replace('{{amount}}',
                        currencySign + parameter.config.amount);

                    template.main = self.template.main;
                    template.main = template.main.replace('{{name}}', parameter.config.name);
                    template.main = template.main.replace('{{image}}', parameter.config.image);
                    template.main = template.main.replace('{{amount}}', parameter.config.amount);
                    template.main = template.main.replace('{{currency}}', parameter.config.currency.toUpperCase());
                    template.main = template.main.replace('{{description}}', parameter.config.description);
                    template.main = template.main.replace('{{currencySign}}', currencySign);

                    template.main = template.main.replace('{{processingPanel}}', template.processing);

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
                },
                customStyling: function() {
                    // parameter.primaryColor

                    var template = '';
                    if (parameter.primaryColor != '' && parameter.primaryColor != 'null' &&
                            parameter.primaryColor != null) {
                        template = self.template.css;
                        template = template.replace(/{{primaryColor}}/gi, parameter.primaryColor);
                    }

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
