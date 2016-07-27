(function() {
    var form = {};
    form.model = new beanstream.payform.FormModel();
    form.template = new beanstream.payform.FormTemplate();
    form.view = new beanstream.payform.FormView(form.model, form.template);
    form.controller = new beanstream.payform.FormController(form.model, form.view);
    form.controller.init();
})();
