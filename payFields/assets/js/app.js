(function () {
    'use strict';

    console.log('Starting Beanstream Payfields...');

    var form = {};
    form.model = new beanstream.FormModel();
    form.view = new beanstream.FormView(form.model);
    form.controller = new beanstream.FormController(form.model, form.view);

    form.controller.init();
})();
