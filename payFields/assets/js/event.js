(function (window) {
    'use strict';

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach: function (Inputener) {
        this._listeners.push(Inputener);
    },
    notify: function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Event = Event;
})(window);
