
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
        this.keyup = new beanstream.Event(this);
        this.paste = new beanstream.Event(this);

        var _this = this;

        // attach model Inputeners
        this._model.valueChanged.attach(function() {
            _this.render("value", "");
        });
        this._model.cardTypeChanged.attach(function() {
            _this.render("cardType", "");
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
                        _this._domParentElements.input.appendChild(inputFrag);
                        _this._domParentElements.label.appendChild(labelFrag);
                    }

                    _this.cacheDom(parameter.id);
                    _this.attachDomListeners();
                },
                value: function() {
                    _this._domElement.value = _this._model.getValue();
                },
                cardType: function() {
                    var cardType = _this._model.getCardType();
                    if(cardType){
                        if(cardType === "maestro") cardType = "mastercard";
                        if(cardType === "visaelectron")  cardType = "visa";
                        _this._domElement.style.backgroundImage = 'url(../assets/css/images/' + cardType + '.png)';
                    } else{
                        _this._domElement.style.backgroundImage = "none";
                    }
                }
            };

            viewCommands[viewCmd]();
        },
        cacheDom: function(id) {
            this._domElement = this._domParentElements.form.querySelectorAll('[data-beanstream-id=' + id + ']')[0];

        },
        attachDomListeners: function() {
            var _this = this;

            this._domElement.addEventListener('keydown', function(e) {
                _this.keydown.notify(e);
            }, false);
            this._domElement.addEventListener('keyup', function(e) {
                var args = {event: e, inputValue: _this._domElement.value};
                _this.keyup.notify(args);
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