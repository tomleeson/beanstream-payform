
describe('Payfields Demo App', function() {
  beforeAll(function() {
        isAngularSite(false);

        browser.driver.get('https://payform-dev.beanstream.com/demos/payfields/');
        browser.sleep(2000);
    });

  it('should have a credit card inputs', function() {
    var number = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccNumber"]'));
    var exp = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccExp"]'));
    var cvv = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccCvv"]'));

    expect(number.isDisplayed()).toBeTruthy();
    expect(exp.isDisplayed()).toBeTruthy();
    expect(cvv.isDisplayed()).toBeTruthy();
  });

  it('should format input', function() {
    var number = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccNumber"]'));
    var exp = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccExp"]'));

    number.sendKeys('4444444444444448');
    exp.sendKeys('012020');

    number.getAttribute('value')
        .then(function(value) {
            expect(value).toEqual('4444 4444 4444 4448');
        });

    exp.getAttribute('value')
        .then(function(value) {
            expect(value).toEqual('01 / 2020');
        });
  });

  it('should return a token', function() {
    var number = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccNumber"]'));
    var exp = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccExp"]'));
    var cvv = browser.driver.findElement(by.xpath('//input[@data-beanstream-id="ccCvv"]'));

    number.sendKeys('4444444444444448');
    exp.sendKeys('012020');
    cvv.sendKeys('123');

    browser.driver.findElement(by.tagName('button')).click();

    browser.sleep(5000);
    var token = browser.driver.findElement(By.id("response"));
    expect(token.isDisplayed()).toBeTruthy();
  });
});
