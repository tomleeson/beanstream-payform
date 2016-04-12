
(function(window) {
    'use strict';

    function IframeTemplate() {
        var self = this;
        self.template =
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
    }

    IframeTemplate.prototype = {

        show: function(path) {
            var self = this;

            var template = self.template;
            template = template.replace('{{path}}', path);
            return template;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.IframeTemplate = IframeTemplate;
})(window);
