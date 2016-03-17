(function() {

    // ToDo: Refactor App logic along MVC pattern for clarity and testibility

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
            labelText: "Expires MM/YY",
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

        this.config.domTargetsFound_input = true;
        this.config.domTargetsFound_error = true;

        for (field in fields) {

            var input = field + "_input";
            var error = field + "_error";
            
            this.domTargets[input] 
                = this.form.querySelector('[data-beanstream-target="'+input+'"]');

            this.domTargets[error] 
                = this.form.querySelector('[data-beanstream-target="'+error+'"]');

            // Set flags. If target missing for any input, ignore all input targets
            if(this.domTargets[input] === null){
                this.config.domTargetsFound_input = false;
            }
            if(this.domTargets[error] === null){
                this.config.domTargetsFound_error = false;
            }
        }

    }

    function attachDomListeners() {
        window.onload = function(event) {
            // validate and get token before submit event
            // button is below script tag, so we wait until it loads
            this.submitBtn = this.form.querySelector("input[type=submit]");
            if (!this.submitBtn) {
                this.submitBtn = this.form.querySelector("button[type=submit]");
            }

            this.submitBtn.addEventListener("click", onSubmit, false);
        };

    }

    function onSubmit(event) {
        var self = this;

        this.submitBtn = this.form.querySelector("input[type=submit]");
        if (!this.submitBtn) {
            this.submitBtn = this.form.querySelector("button[type=submit]");
        }

        event.preventDefault();
        this.submitBtn.disabled = true;

        var data = getFieldValues();
        if(!beanstream.Helper.isEmpty(data)){

            var ajaxHelper = new beanstream.AjaxHelper();
            ajaxHelper.getToken(data, function(args) {
                
                appendToken(self.form, args.token);

                if(this.submitForm){
                    this.form.submit();
                } else{
                    fireEvent('beanstream_tokenUpdated');
                }
            }.bind(self));
        }

        this.submitBtn.disabled = false;
    }

    function appendToken(form, value) {

        var input = form.querySelector("input[name=singleUseToken]");

        if(input){
            input.value = value;
        } else{
            input = document.createElement('input');
            input.type = "hidden";
            input.name = "singleUseToken";
            input.value = value;
            form.appendChild(input);
        }
    }

    function getFieldValues() {

        var data = {};

        var invalidFields = fieldObjs.filter(function( f ) {
              return f.controller._model.getIsValid() === false;
            });

        var emptyFields = fieldObjs.filter(function( f ) {
              return f.controller._model.getValue() === "";
            });

        if(invalidFields.length === 0 && emptyFields.length === 0) {
            for(var i=0; i<fieldObjs.length; i++){

                switch(fieldObjs[i].controller._config.id) {
                    case "cc_number":
                        data.number = fieldObjs[i].controller._model.getValue();
                        break;
                    case "cc_cvv":
                        data.cvd = fieldObjs[i].controller._model.getValue();;
                        break;
                    case "cc_exp":
                        var str = fieldObjs[i].controller._model.getValue();
                        var arr = str.split("/");
                        data.expiry_month = arr[0].trim();
                        data.expiry_year = "20" + arr[1].trim();
                        break;
                    default:
                        break;
                }

                fieldObjs[i].controller._model.setValue("");
            }
        }

        return data;
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

        this.fieldObjs = [];

        for (field in fields) {
            var domTargets = {};
            if (this.config.domTargetsFound_input) {
                domTargets.input = this.domTargets[field + "_input"];
            }
            if (this.config.domTargetsFound_error) {
                domTargets.error = this.domTargets[field + "_error"];
            }
            domTargets.form = this.form;

            var config = new Object;
            config.domTargetsFound_input = this.config.domTargetsFound_input;
            config.domTargetsFound_error = this.config.domTargetsFound_error;
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

            this.fieldObjs.push(f);
        }

        // register listener on controller for cardType changed
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_number";
            });
        field = field[0];

        //attach listeners to new field
        if(field){
            field.controller.cardTypeChanged.attach(function(sender, cardType) {
                setCardType(cardType)
            });
        }

        for (field in this.fieldObjs) {

            this.fieldObjs[field].controller.inputComplete.attach(function(sender) {
                setFocusNext(sender);
            });
            this.fieldObjs[field].controller.inputValidityChanged.attach(function(sender, args) {
                inputValidityChanged(args)
            });
        }

    }

    function setCardType(cardType) {
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_cvv";
            });
        field = field[0];

        if(field){
            field.controller._model.setCardType(cardType);
        }
    }

    function inputValidityChanged(args) {
        fireEvent('beanstream_inputValidityChanged', args);
    }

    function setFocusNext(sender) {

        var currentEl_id = sender._config.id;
        var inputs = form.getElementsByTagName("input");

        var currentInput = getIndexById(inputs, currentEl_id);
        if(inputs[currentInput+1]){
            inputs[currentInput+1].focus();
        } else{
            this.submitBtn.focus();
        }
    }

    function getIndexById(source, id) {
        for (var i = 0; i < source.length; i++) {
            
            if (source[i].getAttribute('data-beanstream-id') === id) {
                return i;
            }
        }
    }

    function fireEvent(title, eventDetail) {
        var event = new CustomEvent(title);
        event.eventDetail = eventDetail;
        document.dispatchEvent(event);
    }

    function readAttributes() {
        this.submitForm = this.script.getAttribute('data-submit-form');

        if(this.submitForm === null || this.submitForm === ""){
            this.submitForm = true;
        }
    }

    function init() {
        this.config = {};

        cacheDom();
        readAttributes();
        attachDomListeners();

        // todo: replace with to absolute link
        injectStyles("../assets/css/style.css");
        injectFields();

        fireEvent('beanstream_loaded');
    }
    init();

})();