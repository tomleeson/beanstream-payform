
(function(window) {
    'use strict';

    /**
     * The Model stores data and notifies the View of changes.
     */
    function InputModel() {
        this._value = "";
        this._isValid = false;

        this.valueChanged = new beanstream.Event(this);
        this.validityChanged = new beanstream.Event(this);
    }

    InputModel.prototype = {

        getValue: function() {
            return this._value;
        },
        setValue: function(value) {
            this._value = value;
            this.valueChanged.notify();
        },
        getIsValid: function() {
            return this._isValid;
        },
        setIsValid: function(valid) {
            this._isValid = valid;
            this.validityChanged.notify();
        }
    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputModel = InputModel;
})(window);

(function(window) {
    'use strict';

    /**
     * The View presents the model and notifies the Controller of UI events.
     */
    function InputView(model, template, domParentElements) {
        this._model = model;
        this._template = template;
        this._domParentElements = domParentElements;

        //this._domParentElement = domParentElements;
        if (domParentElements.form) {
            this._domParentElement = domParentElements.form;
        }

        this.keydown = new beanstream.Event(this);
        this.paste = new beanstream.Event(this);

        var _this = this;

        // attach model Inputeners
        this._model.valueChanged.attach(function() {
            _this.render("value", "");
        });
        this._model.validityChanged.attach(function() {
            //_this.render(errors, "");
        });

    }

    InputView.prototype = {

        render: function(viewCmd, parameter) {
            var _this = this;
            var viewCommands = {
                elements: function() {
                    var template = _this._template.show(parameter);
                    var inputFrag = _this.createDocFrag(template.input);
                    var labelFrag = _this.createDocFrag(template.label);

                    if (!parameter.domTargetsFound) {
                        _this._domParentElements.form.appendChild(labelFrag);
                        _this._domParentElements.form.appendChild(inputFrag);
                    } else {
                        console.log(_this._domParentElements.input);
                        console.log(_this._domParentElements.label);

                        _this._domParentElements.input.appendChild(inputFrag);
                        _this._domParentElements.label.appendChild(labelFrag);
                    }

                    _this.cacheDom(parameter.id);
                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domElement.value = "foo";
                    //_this._domElement.value = this._model.getValue();
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            //this._domElement = document.getElementById(id);
            this._domElement = this._domParentElements.form.querySelectorAll('[data-beanstream-id=' + id + ']')[0];

        },
        attachDomListeners: function() {
            var _this = this;

            this._domElement.addEventListener('keydown', function(e) {
                console.log("domElement keydown: " + this._domElement);
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

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputView = InputView;
})(window);

(function(window) {
    'use strict';

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
        this._view.keydown.attach(function(e) {
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

        this._view.paste.attach(function(e) {
            //console.log("view.paste");
            _this.limitPaste(e);
        });
    }

    InputController.prototype = {

        limitInput: function(keyCode) {
            //console.log("InputController.limitInput");

            // 1. verify keypress from relevant key

            var newChar = String.fromCharCode(keyCode);
            var str = this._model.getValue() + newChar;

            // 2. validate new str

            this._model.setValue(str);

            //console.log(this._model.getValue());
        },

        limitPaste: function(e) {
            //console.log("InputController.limitInput");
        }

    };


    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.InputController = InputController;
})(window);

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

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Event = Event;
})(window);


(function() {

    var fields = {
        cc_number: {
            name: "cardnumber",
            labelText: "Credit Card Number",
            placeholder: "",
            autocomplete: "cc-number"
        },
        cc_cvv: {
            name: "cvc",
            labelText: "CVC",
            placeholder: "",
            autocomplete: "cc-csc"
        },
        cc_exp: {
            name: "cc-exp",
            labelText: "Expires MM/YYYY",
            placeholder: "",
            autocomplete: "cc-exp"
        }
    };


    function cacheDom() {
        // http://stackoverflow.com/a/22745553
        // there may be multiple forms in a page, get ref to current form
        var scripts = document.getElementsByTagName('script');
        this.script = scripts[scripts.length - 1];
        this.form = this.script.parentNode;
        this.head = document.getElementsByTagName("head")[0];
        this.domTargets = {};

        this.domTargets.cc_number_input = this.form.querySelectorAll('[data-beanstream-target="cc_number_input"]')[0];
        this.domTargets.cc_exp_input = this.form.querySelectorAll('[data-beanstream-target="cc_exp_input"]')[0];
        this.domTargets.cc_cvv_input = this.form.querySelectorAll('[data-beanstream-target="cc_cvv_input"]')[0];

        this.domTargets.cc_number_label = this.form.querySelectorAll('[data-beanstream-target="cc_number_label"]')[0];
        this.domTargets.cc_exp_label = this.form.querySelectorAll('[data-beanstream-target="cc_exp_label"]')[0];
        this.domTargets.cc_cvv_label = this.form.querySelectorAll('[data-beanstream-target="cc_cvv_label"]')[0];

        this.config.domTargetsFound = true;
        for (t in this.domTargets) {
            this.config.domTargetsFound = (this.domTargets[t] != undefined);
            if (!this.config.domTargetsFound) break;
        }

        this.config.styled = true;
    }

    function readAttributes() {
        // Looks like we currently do not need any configuration

        //this.config.flag = (this.script.getAttribute('data-styled') === 'true');
    }

    function attachListeners() {
        window.onload = function(event) {
            // validate and get token before submit event
            // button is below script tag, so we wait until it loads
            this.submitBtn = this.form.querySelectorAll("input[type=submit]")[0];
            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelectorAll("button[type=submit]")[0];
            }


            this.submitBtn.addEventListener("click", onSubmit, false);
        };

    }

    function onSubmit(event) {
        console.log("onSubmit");
        this.submitBtn = this.form.querySelectorAll("input[type=submit]")[0];
        if (!this.submitBtn) {
            this.submitBtn = this.form.querySelectorAll("button[type=submit]")[0];
        }

        event.preventDefault();
        this.submitBtn.disabled = true;

        // toDo: add field validation
        // toDo: add getToken

        console.log("submit");

        //this.form.submit();
        this.submitBtn.disabled = false;
    }

    function injectStyles(filename) {

        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)

        if (typeof fileref != "undefined") {
            this.head.appendChild(fileref);
        }
    }

    function injectFields(filename) {
        var config = this.config;

        var fieldObjs = {};

        for (field in fields) {
            var domTargets = {};
            if (this.config.domTargetsFound) {
                domTargets.input = this.domTargets[field + "_input"];
                domTargets.label = this.domTargets[field + "_label"];
                console.log("domTargets.input " + field + "_input");
                console.log("domTargets.label " + field + "_label");
            }
            domTargets.form = this.form;

            config.id = field;
            config.name = fields[field].name;
            config.labelText = fields[field].labelText;
            config.placeholder = fields[field].placeholder;
            config.autocomplete = fields[field].autocomplete;
            var f = {};
            f.model = new beanstream.InputModel();
            f.template = new beanstream.InputTemplate();
            f.view = new beanstream.InputView(f.model, f.template, domTargets);
            f.controller = new beanstream.InputController(f.model, f.view, config);

            fieldObjs[field] = f;
        }

    }

    function fireLoadedEvent() {
        console.log("barr");
        var event = new Event('beanstream_loaded');
        document.dispatchEvent(event);

    }

    function init() {
        this.config = {};

        cacheDom();
        attachListeners();

        // todo: replace with to absolute link
        injectStyles("../assets/css/style.css");
        injectFields();

        fireLoadedEvent();
    }
    init();

})();