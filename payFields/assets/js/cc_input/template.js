
(function(window) {
    'use strict';

    function InputTemplate() {
        this.inputTemplate = '<input id="{{id}}" data-beanstream-id="{{id}}" placeholder="{{placeholder}}" autocomplete="{{autocomplete}}"></input>';

        this.labelTemplate = '<label for="{{id}}">{{labelText}}</label>';
    }

    InputTemplate.prototype.show = function(parameter) {

        var template = {};
        template.label = this.labelTemplate;
        template.input = this.inputTemplate;

        template.label = template.label.replace('{{id}}', parameter.id);
        template.label = template.label.replace('{{labelText}}', parameter.labelText);
        template.input = template.input.replace(/{{id}}/gi, parameter.id);
        template.input = template.input.replace('{{placeholder}}', parameter.placeholder);
        template.input = template.input.replace('{{autocomplete}}', parameter.autocomplete);

        return template;
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputTemplate = InputTemplate;
})(window);