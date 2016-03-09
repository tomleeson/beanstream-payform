var cardCvv = (function(){
	var html = {};
	html.input = '<input class="w3-input" type="tel" id="trnCardCvd" name="cvv" autocomplete="off" required>';
	html.label = '<label for="trnCardCvd">CVV</label>';

	function _cacheDom() {
		this.input = document.getElementById("trnCardCvd");
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
		
		helper.deleteSelectedText(e);
		var newChar = String.fromCharCode(e.keyCode);

		if(input.value.length >= 3 || isNaN(newChar)){
			e.preventDefault();
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
				input.value = validate.formatCvv(str);
			}
		}
	}

	return{
		injectRawHtml: injectRawHtml,
		injectStyledHtml: injectStyledHtml
	}
})();