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

        this.domTargets.cc_number_input = this.form.querySelector('[data-beanstream-target="cc_number_input"]');
        this.domTargets.cc_exp_input = this.form.querySelector('[data-beanstream-target="cc_exp_input"]');
        this.domTargets.cc_cvv_input = this.form.querySelector('[data-beanstream-target="cc_cvv_input"]');

        this.domTargets.cc_number_label = this.form.querySelector('[data-beanstream-target="cc_number_label"]');
        this.domTargets.cc_exp_label = this.form.querySelector('[data-beanstream-target="cc_exp_label"]');
        this.domTargets.cc_cvv_label = this.form.querySelector('[data-beanstream-target="cc_cvv_label"]');

        this.config.domTargetsFound = true;
        for (t in this.domTargets) {
            this.config.domTargetsFound = (this.domTargets[t] != undefined);
            if (!this.config.domTargetsFound) break;
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
        console.log("onSubmit");
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
                setFeedback_demoOnly(args.token);

                //Disabling custom form event for demo
                //this.form.submit();

                console.log("submit");
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

    function setFeedback_demoOnly(token) {

        var responsePanel = document.getElementById("response");
        var responsePanel_token = document.getElementById("token");
        responsePanel_token.innerText = token;
        responsePanel.style.display = "block";
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
            if (this.config.domTargetsFound) {
                domTargets.input = this.domTargets[field + "_input"];
                domTargets.label = this.domTargets[field + "_label"];
            }
            domTargets.form = this.form;

            var config = new Object;
            config.domTargetsFound = this.config.domTargetsFound;
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

        if(field){
            field.controller.cardTypeChanged.attach(function(sender, cardType) {
                setCardType(cardType)
            });
        }
    }

    function setCardType(cardType) {
        var field = this.fieldObjs.filter(function( f ) {
              return f.controller._config.id === "cc_cvv";
            });
        field = field[0];

        if(field){
            field.controller._config.cardType = cardType;
        }
    }

    function fireLoadedEvent() {
        var event = new Event('beanstream_loaded');
        document.dispatchEvent(event);

    }

    function init() {
        this.config = {};

        cacheDom();
        attachDomListeners();

        // todo: replace with to absolute link
        injectStyles("../assets/css/style.css");
        injectFields();

        fireLoadedEvent();
    }
    init();

})();