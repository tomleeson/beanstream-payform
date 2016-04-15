
(function(window) {
    'use strict';

    function IframeTemplate() {
        var self = this;

        // toDo: accept config as peramater and build template like tekenization form
        self.template = {};
        self.template.main =
            '<button>Pay with Card</button>' +
			'<iframe frameborder="0"' +
				'allowtransparency="true"' +
				'src="{{path}}"' +
				'name="stripe_checkout_app"' +
				'class="stripe_checkout_app"' +
				'style="z-index: 2147483647; display: none; border: 0px none transparent;' +
                        'overflow-x: hidden; overflow-y: auto; visibility: visible; margin: ' +
                        '0px; padding: 0px; -webkit-tap-highlight-color: transparent; position: fixed; ' +
                        'left: 0px; top: 0px; width: 100%; height: 100vh;">' +
			'</iframe>';

        self.template.cardInfo =
            '<input type="hidden" name="cardInfo_code" value="">';

        self.template.shippingAddress =
            '<input type="hidden" name="shippingAddress_name" value="">' +
            '<input type="hidden" name="shippingAddress_address_line1" value="">' +
            '<input type="hidden" name="shippingAddress_postal_code" value="">' +
            '<input type="hidden" name="shippingAddress_city" value="">' +
            '<input type="hidden" name="shippingAddress_country" value="">' +
            '<input type="hidden" name="shippingAddress_province" value="">';

        self.template.billingAddress =
            '<input type="hidden" name="billingAddress_name" value="">' +
            '<input type="hidden" name="billingAddress_address_line1" value="">' +
            '<input type="hidden" name="billingAddress_postal_code" value="">' +
            '<input type="hidden" name="billingAddress_city" value="">' +
            '<input type="hidden" name="billingAddress_country" value="">' +
            '<input type="hidden" name="billingAddress_province" value="">';
    }

    IframeTemplate.prototype = {

        show: function(path, config) {
            var self = this;

            console.log(config.billingAddress);

            var template = self.template.main;
            template = template.replace('{{path}}', path);

            template = template + self.template.cardInfo;
            if (config.billingAddress) {
                template = template + self.template.billingAddress;
            }
            if (config.shippingAddress) {
                template = template + self.template.shippingAddress;
            }
            return template;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeTemplate = IframeTemplate;
})(window);
