(function(window) {
    'use strict';

    function InputTemplate() {
        this.inputTemplate =    '<input data-beanstream-id="{{id}}" ' +
                                'placeholder="{{placeholder}}" autocomplete="{{autocomplete}}">';
        this.labelTemplate =    '<label data-beanstream-id="" for="{{id}}">{{labelText}}</label>';
        this.errorTemplate =    '<div data-beanstream-id="{{id}}_error"></div>';
    }

    InputTemplate.prototype.show = function(parameter) {
        var template = {};
        template.label = this.labelTemplate;
        template.input = this.inputTemplate;
        template.error = this.errorTemplate;

        template.label = template.label.replace('{{id}}', parameter.id);
        template.label = template.label.replace('{{labelText}}', parameter.labelText);
        template.input = template.input.replace(/{{id}}/gi, parameter.id);
        template.input = template.input.replace('{{placeholder}}', parameter.placeholder);
        template.input = template.input.replace('{{autocomplete}}', parameter.autocomplete);
        template.error = template.error.replace('{{id}}', parameter.id);

        return template;
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputTemplate = InputTemplate;
})(window);
