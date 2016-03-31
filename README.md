beanstream-payform 
=================
##### Table of Contents  
###### Overview
[Overview](#overview)   
 * [Payfields](#payfields-overview)        
 * [Payform: Tokenisation](#payform-tokenisation-overview)            
 * [Payform: Payment](#payform-payment-overview)        

[Browser Support](#browser-support)  
[Building Locally and Contributing](#contributing)   
###### Payfields
[Functionality](#payfields-functionality)         
[Process Flow](#payfields-process-flow)           
[Integration Guide](#payfields-integration-guide)           
###### Payform
[Functionality](#payform-tokenisation-functionality)         
[Process Flow](#payform-tokenisation-process-flow)   
[Integration Guide](#payform-tokenisation-guide)  

## Overview <a name="overview"/>
The PayForms project umbrella covers three related products: Payfields, PayForm: Tokenisation and PayForm: Payment (Fully Hosted).

##### Payfields <a name="payfields-overview"/>
Payfields is a Beanstream client-side JavaScript library that handles a customers credit card input within the merchant's web page. It limits the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers.

Payfields injects credit card related input fields into the merchant's web page, formats and validates the user input, and makes an AJAX request to Beanstream's tokenisation REST API. It then appends the token to the payment form in the web page and either submits the form or notifies the page that the token has been updated.

Payfields allows the merchant full control of their web site's UX while limiting the scope of their PCI compliance.

Note: Similar to Beanstream Legato

##### PayForm: Tokenisation <a name="payform-tokenisation-overview"/>
PayForm is a Beanstream client-side JavaScript library that handle a customers credit card input, and provides options for collecting shipping and delivery information. As with Payfields it limits the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers.

PayForm injects a "Pay with Card" button into the merchant's web page. Clicking the button displayes payment form in a popover within the merchant's page. The form can be configured to collect just credit card information, or a combination of credit card information, and shipping and/or billing information. 

The credit card information is formated, validated and tokenised. PayForm then returns the token and any address information collected to the merchant's web page.

PayForm: Tokenisation allows the merchant to easily collect payment information on their web site, without to add any payment forms to their page. It limits the scope of their PCI compliance, but allows them to retain control of how the payment itself is processed.

Note: Similar to Stripe Checkout

##### PayForm: Payment (Fully Hosted) <a name="payform-payment-overview"/>

Note: Similar to PayPal Express Checkout 

## Browser Support <a name="browser-support"/>
 * Internet Explorer 8+ (via XDomainRequest and XMLHttpRequest)         
 * Chrome 6.0+          
 * Firefox 3.6+         
 * Opera 12.1+          
 * Safari 4.0+          

<a name="contributing"/>
## Building Locally and Contributing

---
---

Demo:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/bootstrap.html)

Hosted Script:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payForm/payFields/beanstream_payfields.js)

References:
* [REST API](http://developer.beanstream.com/documentation/rest-api-reference/)
* [Tokenization](http://developer.beanstream.com/documentation/take-payments/purchases/take-payment-legato-token/)
* [Payment](http://developer.beanstream.com/documentation/take-payments/purchases/card/)
* [Legato](http://developer.beanstream.com/documentation/legato/)

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

<div data-beanstream-target="ccNumber_input"></div>
<div data-beanstream-target="ccNumber_error"></div>

<div data-beanstream-target="ccExp_input"></div>
<div data-beanstream-target="ccExp_error"></div>

<div data-beanstream-target="ccCvv_input"></div>
<div data-beanstream-target="ccCvv_error"></div>

<button type="submit">Submit</button>
</form>
```

If you wish to style the injected fields after they are loaded you can listen for the "beanstream_loaded" event.

Run form locally:
You can run the code locally by just copy and pasting the above text into a html doc.

You can also check out the project by running `git clone git@github.com:Beanstream-DRWP/beanstream-payform.git` or `git clone https://github.com/Beanstream-DRWP/beanstream-payform.git`.

You  serve the project by running `python -m SimpleHTTPServer 8000`, and navigating to `http://localhost:8000/demos/bootstrap.html` in your browser/

You can run the unit and 3e3 tests by calling 'gulp unit' and 'gulp e2e' respectfully. Call 'gulp scripts' to recompile the js.
