(function (window) {
    'use strict';

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach: function (Inputener) {
        this._listeners.push(Inputener);
    },
    notify: function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};


/**
 * The Model stores data and notifies the View of changes.
 */
function InputModel() {
    this._value = "";
    this._isValid = false;

    this.valueChanged = new Event(this);
    this.validityChanged = new Event(this);
}

InputModel.prototype = {

    getValue: function () {
        return this._value;
    },
    setValue: function (value) {
        this._value = value;
        this.valueChanged.notify();
    },
    getIsValid: function () {
        return this._isValid;
    },
    setIsValid: function (valid) {
        this._isValid = valid;
        this.validityChanged.notify();
    }
};

/**
 * The View presents the model and notifies the Controller of UI events.
 */
function InputView(model, template, domParentElements) {
    this._model = model;
    this._template = template;
    this._domParentElements = domParentElements;
    
    //this._domParentElement = domParentElements;
    if(domParentElements.form){
        this._domParentElement = domParentElements.form;
    }
    
    this.keydown = new Event(this);
    this.paste = new Event(this);

    var _this = this;

    // attach model Inputeners
    this._model.valueChanged.attach(function () {
        _this.render("value", "");
    });
    this._model.validityChanged.attach(function () {
        //_this.render(errors, "");
    });

}

InputView.prototype = {

    render: function (viewCmd, parameter) {
        var _this = this;
        var viewCommands = {
            elements: function () {
                var template = _this._template.show(parameter);
                var inputFrag = _this.createDocFrag(template.input);
                var labelFrag = _this.createDocFrag(template.label);
                
                if(!parameter.domTargetsFound){
                    _this._domParentElements.form.appendChild(labelFrag);
                    _this._domParentElements.form.appendChild(inputFrag);
                } else{
                    console.log(_this._domParentElements.input);
                    console.log(_this._domParentElements.label);

                    _this._domParentElements.input.appendChild(inputFrag);
                    _this._domParentElements.label.appendChild(labelFrag);
                }
                
                _this.cacheDom(parameter.id);
                _this.attachDomListeners();
            },
            value: function () {
                _this._domElement.value = "foo";
                //_this._domElement.value = this._model.getValue();
            }
        };

        viewCommands[viewCmd]();
    },
    cacheDom: function (id) {
        //this._domElement = document.getElementById(id);
        this._domElement = this._domParentElements.form.querySelectorAll('[data-beanstream-id='+id+']')[0];

    },
    attachDomListeners: function () {
        var _this = this;

        this._domElement.addEventListener('keydown', function(e) {
            console.log("domElement keydown: "+ this._domElement);
            _this.keydown.notify(e);
        }, false);
        
        this._domElement.addEventListener('paste', function(e) {
            _this.paste.notify(e);
        }, false);
    },
    createDocFrag: function(htmlStr) {
        // http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    }
};

/**
 * The Controller handles UI events and updates the Model.
 */
function InputController(model, view, config) {

    this._model = model;
    this._view = view;
    this._config = config;

    var _this = this;

    //notifier for view 
    this._view.render("elements", this._config);

    //listen to view events
    this._view.keydown.attach(function (e) {
        //console.log("view.keydown");
        
        // Don't override default functionality except for input
        /*
        if(helper.isNonInputKey(e)){
            return;
         }
        e.preventDefault();
        */

        _this.limitInput(event.keyCode);
    });

    this._view.paste.attach(function (e) {
        //console.log("view.paste");
        _this.limitPaste(e);
    });
}

InputController.prototype = {

    limitInput: function (keyCode) {
        //console.log("InputController.limitInput");

        // 1. verify keypress from relevant key

        var newChar = String.fromCharCode(keyCode);
        var str = this._model.getValue() + newChar;

        // 2. validate new str

        this._model.setValue(str);

        //console.log(this._model.getValue());
    },

    limitPaste: function (e) {
        //console.log("InputController.limitInput");
    }

};

function InputTemplate() {
    this.inputTemplate
    =       '<input id="{{id}}" data-beanstream-id="{{id}}" placeholder="{{placeholder}}" autocomplete="{{autocomplete}}"></input>';

    this.labelTemplate
    =       '<label for="{{id}}">{{labelText}}</label>';
}

InputTemplate.prototype.show = function (parameter) {

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
    window.app = window.app || {};
    window.app.InputTemplate = InputTemplate;
    window.app.InputController = InputController;
    window.app.InputView = InputView;
    window.app.InputModel = InputModel;
})(window);
