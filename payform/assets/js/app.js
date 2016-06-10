(function() {

    console.log('Starting Beanstream Payform...');

    var iframe = {};
    iframe.model = new beanstream.IframeModel();
    iframe.template = new beanstream.IframeTemplate();
    iframe.view = new beanstream.IframeView(iframe.model, iframe.template);
    iframe.controller = new beanstream.IframeController(iframe.model, iframe.view);

    iframe.controller.init();

    var remoteCommunictionRecieved = false;

    // Logging to help users identify event errors in their environments
    setTimeout(function() {
        if (!remoteCommunictionRecieved) {
            console.log('*************************************************');
            console.log('Error: Unable to communicate with remote page. Please check your server settings.');
            console.log('*************************************************');
        }
    }.bind(this),7000);

    window.addEventListener('message', function(event) {
        if (JSON.parse(event.data).type === 'beanstream_testMessage') {
            remoteCommunictionRecieved = true;
            console.log('Communication verified.');
        }
    }.bind(this), false);

})();
