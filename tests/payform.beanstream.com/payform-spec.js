
const parentWinHandle = browser.driver.getWindowHandle();

describe('Payform Demo App', function() {
  beforeAll(function() {
        isAngularSite(false);

        browser.driver.get('https://payform.beanstream.com/demos/payfields/');
        browser.sleep(2000);
    });

    it('should show popover on "Pay by card" click', function() {
      var btn = element(by.xpath('.//*[.="Pay by card"]'));
      expect(btn.isPresent()).toBeTruthy();

      var iframe = element(by.tagName('iframe'));
      expect(iframe.isPresent()).toBeTruthy();

      var iframeWrapper = iframe.element(by.xpath('..'));
      expect(iframeWrapper.isPresent()).toBeTruthy();
      expect(iframeWrapper.isDisplayed()).toBeFalsy();

      btn.click();

      expect(iframeWrapper.isDisplayed()).toBeTruthy();
    });

    it('should show payfields in popover', function() {
      browser.switchTo().frame(0);

      var number = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccNumber"]'));
      var exp = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccExp"]'));
      var cvv = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccCvv"]'));

      expect(number.isDisplayed()).toBeTruthy();
      expect(exp.isDisplayed()).toBeTruthy();
      expect(cvv.isDisplayed()).toBeTruthy();
    });

    it('should hide popover after a tokenization', function() {

      var number = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccNumber"]'));
      var exp = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccExp"]'));
      var cvv = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccCvv"]'));

      var email = browser.driver.findElement(by.id('card_email'));
      var name = browser.driver.findElement(by.id('card_name'));

      email.sendKeys('aa@aa.aa');
      name.sendKeys('aa');
      number.sendKeys('4444444444444448');
      exp.sendKeys('012020');
      cvv.sendKeys('123');

      browser.driver.findElement(by.tagName('button')).click();
      browser.sleep(1000);

      var processingScreen = browser.driver.findElement(by.id('processing'))
      expect(processingScreen.isDisplayed()).toBeTruthy();

      browser.sleep(5000);

      browser.driver.switchTo().window(parentWinHandle);
      var iframe = element(by.tagName('iframe'));
      var iframeWrapper = iframe.element(by.xpath('..'));
      expect(iframeWrapper.isDisplayed()).toBeFalsy();

    });

});
