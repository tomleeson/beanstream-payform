
(function(window) {
    'use strict';

    var Helper = (function() {
        function isNonInputKey(event) {

            if (event.shiftKey || event.ctrlKey || event.shiftKey || event.metaKey 
                || event.keyCode === 8 //backspace
                || event.keyCode === 9 //tab
                || event.keyCode === 13 //enter
                || event.keyCode === 37 //left arrow
                || event.keyCode === 39 //right arrow
                || event.keyCode === 45 //insert
                || event.keyCode === 46 //delete
            ) {
                return true;
            }
            return false;
        }

        function deleteSelectedText(e) {

            e.target.value = e.target.value.replace(e.target.value.substring(e.target.selectionStart, e.target.selectionEnd), "");
        }

        function createDocFrag(htmlStr) {
            // http://stackoverflow.com/questions/814564/inserting-html-elements-with-javascript
            var frag = document.createDocumentFragment(),
                temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            return frag;
        }

        return {
            isNonInputKey: isNonInputKey,
            deleteSelectedText: deleteSelectedText,
            createDocFrag: createDocFrag
        }
    })();

    // Export to window
    window.beanstream = window.beanstream || {};
    window.beanstream.Helper = Helper;
})(window);