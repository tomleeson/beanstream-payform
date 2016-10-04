(function(window) {
    'use strict';

    /**
    * Entry point for the Payfields app
    * Functionality:
    * 1. Injects card fields into DOM
    * 2. OnSubmit tokenises field content, clears them and appends hidden field to form
    * 3. Fires 'beanstream_tokenUpdated' event to document if 'data-submitForm' attribute is set to false
    */

    console.log('Starting Beanstream Payfields...');

    function Form() {
        var self = this;
        var currentScript = document.currentScript;
        self.model = new beanstream.FormModel();
        self.view = new beanstream.FormView(self.model, currentScript);
        self.controller = new beanstream.FormController(self.model, self.view);

        if (document.currentScript.hasAttribute('async')) {
            self.controller.init();
        } else {
            // toDo: listen to load event rather than binding to window.onload prop (breaking change)

            window.onload = function() {
                self.controller.init();
            };
        }
    };

    var form = new Form();

})(window);
