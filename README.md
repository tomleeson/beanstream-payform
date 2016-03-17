beanstream-payform 
=================

The PayForms project umbrella covers two distinct features: injected PayFields and hosted PayForms. The Hosted PayForms feature comes in two flavours: a hosted tokenization form and a hosted payment form.

Demo:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/bootstrap.html)

Hosted Script:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/beanstream_payfields.js)

References:
* [REST API](http://developer.beanstream.com/documentation/rest-api-reference/)
* [Tokenization](http://developer.beanstream.com/documentation/take-payments/purchases/take-payment-legato-token/)
* [Payment](http://developer.beanstream.com/documentation/take-payments/purchases/card/)


How to consume:
The PayFields library is intended to be consumed as a remotely hosted dependency via a CDN. 

```javascript
<script src="https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/beanstream_payfields.js"></script>
```

Configure behaviour:
The script expects to be loaded inside form tags. The script listens for the click event of the submit button/input with the form. If the fields are valid it adds a token to a hidden field. The script can then either submit the form (by calling form.submit() which will call the script specified in the form's action attribute) or send a "beanstream_tokenUpdated" event. 

You can configure this behaviour by setting the "data-submit-form" data attribute on the script tag. This is the only behavioural configuration currently available.

```javascript
<form>
<script src="https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/beanstream_payfields.js"
        data-submit-form="false"></script>

<button type="submit">Submit</button>
</form>
```

Configure display:
You can configure this display of the form by setting placeholders for the fields and for the error messages. By default the fields are appended to the form. If a placeholder is found for each of the three fields, the inputs will be appended to each of their respective placeholders. If a placeholder is found for each of the error message blocks corresponding to the three fields, error messages will be appended to their respective placeholders. If you specify an input placeholder, but not an error message placeholder, no error messages will be displayed. You are able to listen for error messages on "beanstream_inputValidityChanged" events. The event returns an object with the following structure: {isValid: boole, error: string}

```javascript
<form>
<script src="https://tbd.com/Beanstream_PayFields.js"
        data-submit-form="false"></script>

<div data-beanstream-target="cc_number_input"></div>
<div data-beanstream-target="cc_number_error"></div>

<div data-beanstream-target="cc_exp_input"></div>
<div data-beanstream-target="cc_exp_error"></div>

<div data-beanstream-target="cc_cvv_input"></div>
<div data-beanstream-target="cc_cvv_error"></div>

<button type="submit">Submit</button>
</form>
```

If you wish to style the injected fields after they are loaded you can listen for the "beanstream_loaded" event.

Run form locally:
You can run the code locally by just copy and pasting the above text into a html doc.

You can also check out the project by running `git clone git@github.com:Beanstream-DRWP/beanstream-payform.git` or `git clone https://github.com/Beanstream-DRWP/beanstream-payform.git`.

You  serve the project by running `python -m SimpleHTTPServer 8000`, and navigating to `http://localhost:8000/demos/bootstrap.html` in your browser/

You can run the unit and 3e3 tests by calling 'gulp unit' and 'gulp e2e' respectfully. Call 'gulp scripts' to recompile the js.
