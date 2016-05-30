(function() {

    console.log('Starting Beanstream Payform...');

    var iframe = {};
    iframe.model = new beanstream.IframeModel();
    iframe.template = new beanstream.IframeTemplate();
    iframe.view = new beanstream.IframeView(iframe.model, iframe.template);
    iframe.controller = new beanstream.IframeController(iframe.model, iframe.view);

    iframe.controller.init();

})();
