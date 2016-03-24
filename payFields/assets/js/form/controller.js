(function (window) {
    'use strict';

    /**
     * The Controller handles UI events and updates the Model.
     */
    function FormController(model, view) {
        var self = this;
        self._model = model;
        self._view = view;

        self._view.init();
        self._view.submit.attach(function(sender, e) {
            self.onSubmit(e);
        });
    }

    FormController.prototype = {
        init: function () {
            var self = this;
            self._view.render("injectStyles", "https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/style.css");
            //self._view.render("injectStyles", "../assets/css/style.css");
            self.injectFields();
            self.fireEvent('beanstream_loaded');
        },
        onSubmit: function (e) {
            var self = this;
            e.preventDefault();

            var data = self.getFieldValues();

            if (!beanstream.Helper.isEmpty(data)) {
                self._view.render("enableSubmitButton", "false");

                var ajaxHelper = new beanstream.AjaxHelper();
                ajaxHelper.getToken(data, function (args) {
                    self._view.render("appendToken", args.token);

                    if (this._model.getSubmitForm()) {
                        self._view.form.submit();
                    } else {
                        self.fireEvent('beanstream_tokenUpdated');
                    }
                    self._view.render("enableSubmitButton", "true");
                }.bind(self));
            } else {
                self._view.render("enableSubmitButton", "true");
            }
        },
        appendToken: function (form, value) {
            var input = form.querySelector("input[name=singleUseToken]");

            if (input) {
                input.value = value;
            } else {
                input = document.createElement('input');
                input.type = "hidden";
                input.name = "singleUseToken";
                input.value = value;
                form.appendChild(input);
            }
        },
        injectFields: function (filename) {
            this.fieldObjs = [];

            var fields = this._model.getFields();

            for (var field in fields) {
                var domTargets = {};
                if (this._model.getDomTargetsFound("inputs")) {
                    domTargets.input = this._view.domTargets[field + "_input"];
                }
                if (this._model.getDomTargetsFound("errors")) {
                    domTargets.error = this._view.domTargets[field + "_error"];
                }
                domTargets.form = this._view.form;

                var config = new Object;
                config.domTargetsFound_input = this._model.getDomTargetsFound("inputs");
                config.domTargetsFound_error = this._model.getDomTargetsFound("errors");
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
            var self = this;

            if(field){
                field.controller.cardTypeChanged.attach(function(sender, cardType) {
                    self.setCardType(cardType);
                }.bind(self));
            }
            
            for (field in this.fieldObjs) {
                this.fieldObjs[field].controller.inputComplete.attach(function(sender) {
                    self._view.render("setFocusNext", sender);
                }.bind(self));

                this.fieldObjs[field].controller.inputValidityChanged.attach(function(sender, args) {
                    self.inputValidityChanged(args);
                }.bind(self));
            }
        },
        setCardType: function(cardType) {
            var field = this.fieldObjs.filter(function( f ) {
                  return f.controller._config.id === "cc_cvv";
                });
            field = field[0];

            if(field){
                field.controller._model.setCardType(cardType);
            }
        },
        inputValidityChanged: function(args) {
            var self = this;
            self.fireEvent('beanstream_inputValidityChanged', args);
        },
        fireEvent: function(title, eventDetail) {
            var event = new CustomEvent(title);
            event.eventDetail = eventDetail;
            document.dispatchEvent(event);
        },
        getFieldValues: function() {
            var data = {};

            var invalidFields = this.fieldObjs.filter(function( f ) {
                  return f.controller._model.getIsValid() === false;
                });

            var emptyFields = this.fieldObjs.filter(function( f ) {
                  return f.controller._model.getValue() === "";
                });

            if(invalidFields.length === 0 && emptyFields.length === 0) {
                for(var i=0; i<this.fieldObjs.length; i++){
                    switch(this.fieldObjs[i].controller._config.id) {
                        case "cc_number":
                            data.number = this.fieldObjs[i].controller._model.getValue();
                            break;
                        case "cc_cvv":
                            data.cvd = this.fieldObjs[i].controller._model.getValue();
                            break;
                        case "cc_exp":
                            var str = this.fieldObjs[i].controller._model.getValue();
                            var arr = str.split("/");
                            data.expiry_month = arr[0].trim();
                            data.expiry_year = "20" + arr[1].trim();
                            break;
                        default:
                            break;
                    }

                    this.fieldObjs[i].controller._model.setValue("");
                }
            }

            return data;
        }
    };

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.FormController = FormController;
})(window);
