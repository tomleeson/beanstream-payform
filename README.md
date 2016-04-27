beanstream-payform 
=================
##### Table of Contents  
###### Overview
[Overview](#overview)     
&nbsp;&nbsp;&nbsp;&nbsp;[Payfields](#payfields-overview)        
&nbsp;&nbsp;&nbsp;&nbsp;[Payform: Tokenisation](#payform-tokenisation-overview)            
&nbsp;&nbsp;&nbsp;&nbsp;[Payform: Payment](#payform-payment-overview)  
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
Payfields is a Beanstream client-side JavaScript library that handles a customer's credit card input within the merchant's web page. It limits the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers.

Payfields injects credit card related input fields into the merchant's web page, formats and validates the user input, and makes an AJAX request to Beanstream's tokenization REST API. It then appends the token to the payment form in the web page and either submits the form or notifies the page that the token has been updated.

Payfields allows the merchant full control of their web site's UX while limiting the scope of their PCI compliance.

Note: Similar to Beanstream Legato

##### PayForm: Tokenization <a name="payform-tokenisation-overview"/>
PayForm is a Beanstream client-side JavaScript library that handle a customer's credit card input, and provides options for collecting shipping and delivery information. As with Payfields it limits the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers.

PayForm injects a "Pay with Card" button into the merchant's web page. Clicking the button displays payment form in a popover within the merchant's page. The form can be configured to collect just credit card information, or a combination of credit card information, and shipping and/or billing information. 

The credit card information is formatted, validated and tokeniZed. PayForm then returns the token and any address information collected to the merchant's web page.

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
 * Check out repo: `$ git clone git@github.com:Beanstream/beanstream-payform.git`
 * Navigate to sub-project:  `$ cd /beanstream-payform/payFields`
 * Run local server: `$ python -m SimpleHTTPServer 8000`
 * Open page in browser: `localhost:8000/demos/test.html` 
   * Note: test.html loads locally hosted script. Other demo pages load remotely hosted script

##### Commit process
 1 `$ git rebase`       
 2 `$ gulp` Runs runs JSCS linting task, concatenates scripts, and runs unit tests.      
 3 `$ git push`         
 
## Payfields
##### Payfields <a name="payfields-functionality"/>     
 * Injects input fields into page. (credit card number, CVD, or expiry)    
 * Assesses card type (Mastercard, Visa, etc.) and restricts, formats and validates input accordingly.   
 * TokniZes card data, clears fields, and appends hidden field containing token to form.
 * Fires event onLoad to allow custom styling. Fires event onValidationChange to allow custom error messaging. Fires event onTokenUpdated to allow merchant to control form submission flow. (By default the form is submitted when the token is appended)
 
##### Process Flow <a name="payfields-process-flow"/>   

##### Integration Guide <a name="payfields-integration-guide"/>   
The minimal integration involves adding the script tag to a webpage within a form containing a submit button.
```javascript
<form action='foo.php'>
  <script src='https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js'></script>
  <button type='submit'>Submit</button>
</form>
```

The above example uses Payforms' default display and behaviour, but it is also possible to configure both. 
 * Placeholders can be added to the HTML markup to specify where the fields are injected.  
 * The web page can listen for callbacks from Payfields to handle styling and error states
 * The 'data-submit-form' attribute on the script tag can be used to specify if the Payflelds should submit the form after tokenisation, or just fire an event.

The integration below shows placeholders and the data attribute inuse. It shows Payfields placeholders within the markup of a Bootstrap styled form.
```javascript
<form action='foo.php'>
  <div class='form-group'>
    <label>Card Number</label>
    <div data-beanstream-target='ccNumber_input'></div>
    <div data-beanstream-target='ccNumber_error' class='help-block'></div>
  </div>
  <div class='form-group'>
    <label>Expiry (MM/YY)</label>
    <div data-beanstream-target='ccExp_input'></div>
    <div data-beanstream-target='ccExp_error' class='help-block'></div>
  </div>
  <div class='form-group'>
    <label>CVV</label>
    <div data-beanstream-target='ccCvv_input'></div>
    <div data-beanstream-target='ccCvv_error' class='help-block'></div>
  </div>
  <script src='https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js'     
          data-submit-form='false'></script>
  <button type='submit' class='btn btn-default'>Submit</button>
</form>
```

---
---

Demo:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/bootstrap.html)

Hosted Script:
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js)

References:
* [REST API](http://developer.beanstream.com/documentation/rest-api-reference/)
* [Tokenization](http://developer.beanstream.com/documentation/take-payments/purchases/take-payment-legato-token/)
* [Payment](http://developer.beanstream.com/documentation/take-payments/purchases/card/)
* [Legato](http://developer.beanstream.com/documentation/legato/)

