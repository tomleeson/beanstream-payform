var cardExpiry = (function(){
	var html = {};
	html.input = '<input class="w3-input" type="tel" id="trnExpMonth" name="cc-exp" autocomplete="cc-exp" required>';
	html.label = '<label for="trnExpMonth">Expiry</label>';


	function _cacheDom() {
		this.input = document.getElementById("trnExpMonth");
	}

	function injectRawHtml(ele) {

		var frag = helper.createDocFrag(this.html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function injectStyledHtml(ele) {

		var frag =  helper.createDocFrag(html.label + html.input);
		ele.appendChild(frag);

		_cacheDom();
		_attachListeners();
	}

	function _attachListeners() {
		if (typeof this.input!="undefined"){
		    this.input.addEventListener('keydown', _onKeydown, false);
			this.input.addEventListener('paste', _onPaste, false);
		}
	}

	function _onKeydown(e) {
		if(helper.isNonInputKey(e)){
		    return;
		 }
		e.preventDefault();
		helper.deleteSelectedText(e);

		var newChar = String.fromCharCode(e.keyCode);

		if (!isNaN(newChar)){
			e.target.value = validate.formatExpiry(e.target.value, newChar);
		}
		return false;
	}

	function _onPaste(e) {
		e.preventDefault();
		helper.deleteSelectedText(e);

		if (e && e.clipboardData && e.clipboardData.getData) {
			if (/text\/plain/.test(e.clipboardData.types)) {

				var data = e.clipboardData.getData('text/plain');
				var data = data.replace( /^\D+/g, ''); // remove non-numeric data
				var str = input.value + data;
				e.target.value = validate.formatExpiry(str, '');
			}
		}
	}

	return{
		injectRawHtml: injectRawHtml,
		injectStyledHtml: injectStyledHtml
	}
})();