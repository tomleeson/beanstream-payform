
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

        var fieldObjs = {};

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

            fieldObjs[field] = f;
        }

        /*
        for (field in fields) {
            console.log(field);
            console.log(fieldObjs[field]);
        }
        */

    }

    function fireLoadedEvent() {
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