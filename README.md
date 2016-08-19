<img src="http://www.beanstream.com/wp-content/uploads/2015/08/Beanstream-logo.png" />

# PayForm & PayFields for web

[![Build Status](https://travis-ci.org/Beanstream/beanstream-payform.svg?branch=master)](https://travis-ci.org/Beanstream/beanstream-payform)

##### Table of Contents  

* [Overview](#overview)
* [Browser Support](#browser-support)
* [PayForm](#payform)
 * [How It Works](#payform-functionality)
 * [Integration Guide](#payform-integration-guide)
* [PayFields](#payfields)
 * [Integration Guide](#payfields-integration-guide)
* [Building Locally and Contributing](#contributing)
* [Demo](#demo)

## Overview <a name="overview"/>
The PayForm project umbrella covers two related products: PayForm and PayFields.

These products are Beanstream client-side JavaScript libraries that handle a customer's credit card input within the merchant's web page. They limit the scope of the merchant's PCI compliance by removing the need for them to pass the sensitive information (credit card number, CVD, or expiry) through their servers and from having to write and store code that comes in contact with that sensitive information.

Both products provide an easy way to accept payments in a web page. They provide some client-side validation, smart field data formatting, and responsive design.


## Browser Support <a name="browser-support"/>
 * Internet Explorer 8+ (via XDomainRequest and XMLHttpRequest) - **still in testing**
 * Chrome 6.0+          
 * Firefox 3.6+         
 * Opera 12.1+          
 * Safari 4.0+          

# PayForm <a name="payform"/>

PayForm is a small Javascript library that injects a payment button and an iframe into your web page. When the user clicks the button a payment form is rendered into the iframe with an appearance similar to that of a popover dialog.

## How It Works <a name="payform-functionality"/>
The PayForm script is read and executed as your page loads. It injects a payment button and an iframe into your web page. When the user clicks the button a payment form is rendered into the iframe. The payment form may contain input fields for a shipping address, for a billing address and for credit card details.

Once the user has completed all fields with valid input the iframe is removed from the UI and a 'beanstream_payform_complete' event is fired containing the address information and a token for the credit card details.

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
        data-image="https://downloads.beanstream.com/images/payform/cc_placeholder.png"
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
    document.addEventListener('beanstream_payform_complete', function(e) {
        // e.eventDetail.cardInfo
        // e.eventDetail.billingAddress
        // e.eventDetail.shippingAddress

        // send payment data to the server here
        // or read it when it is submitted to your server through the form post
    }, false);
</script>
```
This will inject a button in the location of the `<form>` and when the customer clicks on it, the PayForm will pop up. As soon as the customer fills out the information and hits the **Pay** button at the end, PayForm will tokenize the card data and submit the form. Just before the form is submitted it will fire an event called `beanstream_payform_complete` that you can listen to so you can retrieve a JSON format of the form data to send to your server. This event also allows you to perform an asynchronous AJAX call to your server to process the payment if you want. This is described in the next section: Response Fields.

Note that the `<form action="/charge">` element, where `/charge` is your service processing the payment, will have the payment data posted to it only if you set the data attribute `data-submitForm="true"`.

### Step 2: Response Fields
There are two ways to collect the card token and form data. This is controlled by the `data-submitForm="false"` attribute. If you set it to false, then the 'beanstream_payform_complete' event will be triggered and you can send the data to your server asynchronously. The JSON blob will be in the `eventDetail` section of the event data. The card token will be `eventDetail.cardInfo.code`.

If `data-submitForm="true"` then the data collected is injected into hidden fields in the `<form>` element wrapping the PayForm script element. The whole message looks like this:

```json
 {
  "isTrusted":false,
  "eventDetail":{
    "cardInfo":{
      "code":"a01-ae366cb9-3efa-4c82-b955-0bf59e2df359",
      "name":"Joe",
      "email":"aa@test.com"
    },
    "billingAddress":{
      "name":"Joe",
      "address_line1":"123 Fake St",
      "postal_code":"aa",
      "city":"aa",
      "province":"aa",
      "country":"aa"
    },
    "shippingAddress":{
      "name":"Joe",
      "address_line1":"123 Fake St",
      "postal_code":"aa",
      "city":"aa",
      "province":"aa",
      "country":"aa"
    }
}}
 ```


## Step 3: Process The Payment

Whether you collect the card data from the event and send it asynchronously to your server, or receive it directly on your server via form POST, you will need to collect the `eventDetail.cardInfo.code` string vale, that is your token that you will process the payment with. In the above output example the token is *a01-ae366cb9-3efa-4c82-b955-0bf59e2df359**.

Now that you have tokenized card data on your server, use it to either [process or pre-authorize a payment](http://developer.beanstream.com/documentation/take-payments/purchases/take-payment-legato-token/), or create a [payment profile](http://developer.beanstream.com/tokenize-payments/create-new-profile/).

# PayFields <a name="payfields"/>   
PayFields is very similar to PayForm, but it allows you to design your own form. It simply:
 * Injects input fields into page. (credit card number, CVD, or expiry).
 * Recognizes card type (Mastercard, Visa, etc.) and restricts, formats and validates input accordingly.   
 * Tokenizes card data, clears fields, and appends hidden field containing token to form.
 * Fires event `onLoad` to allow custom styling. Fires event `onValidationChange` to allow custom error messaging. Fires event `onTokenUpdated` to allow merchant to control form submission flow. (By default the form is submitted when the token is appended).

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
 * The web page can listen for callbacks from Payfields to handle styling and error states.
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

# Demo <a name="demo"/>
* [PayForm](https://s3-us-west-2.amazonaws.com/demos.beanstream.com/payform/production/index.html)
* [PayFields](https://s3-us-west-2.amazonaws.com/demos.beanstream.com/payfields/production/index.html)

You can view the page source of either of the above demos to see how PayForm and PayFields were integrated. Feel free to copy-paste the code into your site.

## Hosted Script
* [PayFields](https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js)

# API References
* [REST API](http://developer.beanstream.com/documentation/rest-api-reference/)
* [Tokenization](http://developer.beanstream.com/documentation/take-payments/purchases/take-payment-legato-token/)
* [Payment](http://developer.beanstream.com/documentation/take-payments/purchases/card/)
* [Legato](http://developer.beanstream.com/documentation/legato/)
