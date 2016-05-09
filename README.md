beanstream-payform 
=================
##### Table of Contents  

* [Overview](#overview)
 * [PayForm](#payform-overview)
 * [PayFields](#payfields-overview)
* [Browser Support](#browser-support)
* [PayForm](#payform) 
 * [Functionality](#payform-functionality)
 * [Integration Guide](#payform-integration-guide)
* [PayFields](#payfields) 
 * [Integration Guide](#payfields-integration-guide)
* [Building Locally and Contributing](#contributing)

## Overview <a name="overview"/>
The PayForms project umbrella covers two related products: PayForm and PayFields.

These products are Beanstream client-side JavaScript libraries that handle a customer's credit card input within the merchant's web page. They limit the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers and from having to write and store code that comes in contact with that sensitive information.

Both products provide an easy way to accept payments in a web page. They provide some client-side validation, smart field data formatting, and responsive design.

##### PayForm <a name="payform-overview"/>

PayForm injects a "Pay with Card" button into the merchant's web page. Clicking the button displays payment form in a popover within the merchant's page. The form can be configured to collect just credit card information, or a combination of credit card information, and shipping and/or billing information. 

The credit card information is formatted, validated and tokeniZed. PayForm then returns the token and any address information collected to the merchant's web page.

PayForm: Tokeniztoation allows the merchant to easily collect payment information on their web site, without to add any payment forms to their page. It limits the scope of their PCI compliance, but allows them to retain control of how the payment itself is processed.


##### Payfields <a name="payfields-overview"/>

Payfields injects credit card related input fields into the merchant's web page, formats and validates the user input, and makes an AJAX request to Beanstream's tokenization REST API. It then appends the token to the payment form in the web page and either submits the form or notifies the page that the token has been updated.

Payfields allows the merchant full control of their web site's UX while limiting the scope of their PCI compliance.

**Note: This is similar to Beanstream's Legato**

## Browser Support <a name="browser-support"/>
 * Internet Explorer 8+ (via XDomainRequest and XMLHttpRequest)         
 * Chrome 6.0+          
 * Firefox 3.6+         
 * Opera 12.1+          
 * Safari 4.0+          

# PayForm <a name="payform"/>

PayForm is a small Javascript library that injects a payment button and an iframe into your web page. When the user clicks the button a payment form is rendered into the iframe with an appearance similar to that of a popover dialog.

## How It Works <a name="payform-functionality"/>
The PayForm script is read and executed as your page loads. It injects a payment button and an iframe into your web page. When the user clicks the button a payment form is rendered into the iframe. The payment form may contain input fields for a shipping address, for a billing address and for credit card details.

Once the user has completed all fields with valid input the iframe is removed from the UI and a 'beanstream_Payform_complete' event is fired containing the address information and a token for the credit card details.

## Integration <a name="payform-integration-guide"/>
Adding PayForm to your web page could not be easier. You simply add a script element pointing at the PayForm script. PayForm is configured by setting data attributes on the script element. It can be configured to collect shipping and billing addresses in addition to the card details.

The required parameters are:
* data-amount: the amount you are going to charge the customer
* data-currency: the currency

The optional parameters are:
* data-name: your company name
* data-image: your company logo
* data-description: a description of the purchase
* data-shippingAddress: if the shipping address is required - true/false
* data-billingAddress: if the billing address is required - true/false
* data-submitForm: if the form's default action should be executed - true/false

### Step 1: Add PayForm To Your Form
The first step is to create an HTML form that will submit the payment data to your server. In that form you add a `<script>` element that points to [https://payform.beanstream.com/payform/beanstream_payform.js](https://payform.beanstream.com/payform/beanstream_payform.js). You can also supply several parameters to configure the form, such as your company name, logo, product description, price, currency, and whether billing/shipping addresses should be displayed. Here is an example:
```html
<form action="/charge" method="POST">
    <script 
        src="https://payform.beanstream.com/payform/beanstream_payform.js"
        data-image="http://downloads.beanstream.com/images/payform/cc_placeholder.png"
        data-name="foo.com"
        data-description="2 widgets"
        data-amount="2000"
        data-currency="cad"
        data-billingAddress="true"
        data-shippingAddress="true"
        data-submitForm="false">
    </script>
</form>

<script>
    document.addEventListener('beanstream_Payform_complete', function(e) {
        // e.eventDetail.cardInfo
        // e.eventDetail.billingAddress
        // e.eventDetail.shippingAddress
    }, false);
</script>
```
This will inject a button in the location of the `<form>` and when the customer clicks on it, the PayForm will pop up. As soon as the customer fills out the information and hits the **Pay** button at the end, PayForm will tokenize the card data and submit the form with that token and address info. Just before the form is submitted it will fire an event called `beanstream_Payform_complete` that you can listed to and perform any last second operations before the form submits.

### Step 2: Response Fields
The data collected is injected into hidden fields in the `<form>` element wrapping the PayForm script element. It is also returned as a JSON blob with the event 'beanstream_Payform_complete'. The form is automatically submitted to your server. On your server you will look for the following fields to retrieve the payment data:

 
# Payfields <a name="payfields"/>   
PayFields is very similar to PayForm, but it allows you to design your own form. It simply:
 * Injects input fields into page. (credit card number, CVD, or expiry)    
 * Recognizes card type (Mastercard, Visa, etc.) and restricts, formats and validates input accordingly.   
 * Toknizes card data, clears fields, and appends hidden field containing token to form.
 * Fires event `onLoad` to allow custom styling. Fires event `onValidationChange` to allow custom error messaging. Fires event `onTokenUpdated` to allow merchant to control form submission flow. (By default the form is submitted when the token is appended)
 
#### Integration <a name="payfields-integration-guide"/>   
The minimal integration involves adding the script tag to a webpage within a form containing a submit button.
```javascript
<form action='foo.php'>
  <script src='https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js'></script>
  <button type='submit'>Submit</button>
</form>
```
`foo.php` is an example of your server's API endpoint where you want to handle a payment being processed.

The above example uses PayField's default display and behaviour, but it is also possible to configure it: 
 * Placeholders can be added to the HTML markup to specify where the fields are injected.  
 * The web page can listen for callbacks from Payfields to handle styling and error states
 * The 'data-submit-form' attribute on the script tag can be used to specify if the Payflelds should submit the form after tokenization, or just fire an event.

The integration below shows placeholders and the data attribute in use. It shows PayFields placeholders within the markup of a Bootstrap styled form.
```html
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

