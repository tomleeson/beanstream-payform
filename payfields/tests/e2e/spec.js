// https://github.com/sakshisingla/Protractor-Non-Angular-Tests/wiki/
// Creating-test-scripts-using-Protractor-for-non-angular-application
// http://www.seleniumhq.org/docs/03_webdriver.jsp

describe('Payfields', function() {
    it('should have a title', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');
        expect(browser.driver.getTitle()).toEqual('Bootstrap Example');
    });

    it('should contain card number field', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');

        browser.driver.findElement(by.css('input[data-beanstream-id="ccNumber"]')).then(function(element) {
            //alert('Found an element that was not expected to be there!');
            expect(true).toEqual(true);
        }, function(error) {
            //alert('The element was not found, as expected');
            expect(true).toEqual(false);
        });
    });

    it('should format card numbers for known card types: VISA', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');

        var input = browser.driver.findElement(by.css('input[data-beanstream-id="ccNumber"]'));
        input.sendKeys('4485248840847322');
        expect(input.getAttribute('value')).toEqual('4485 2488 4084 7322');
    });

    it('should format card numbers for known card types: MasterCard', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');

        var input = browser.driver.findElement(by.css('input[data-beanstream-id="ccNumber"]'));
        input.sendKeys('5259376611894651');
        expect(input.getAttribute('value')).toEqual('5259 3766 1189 4651');
    });

    it('should format card numbers for known card types: AMEX', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');

        var input = browser.driver.findElement(by.css('input[data-beanstream-id="ccNumber"]'));
        input.sendKeys('347472653651920');
        expect(input.getAttribute('value')).toEqual('3474 726536 51920');
    });

    // Protractor API getCssValue() does not sem to work with non-angular apps,
    // so we are currently unable to test if card type is visible

    /*
      it('should show card trye icon for known card types', function() {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:8000/demos/bootstrap.html');

        var input = browser.driver.findElement(by.css('input[data-beanstream-id="ccNumber"]'));
        input.sendKeys('347472653651920');
        console.log("foo");
        //console.log("input: "+input.style);
        input.getCssValue("background-color");
        //expect(input.style.backgroundImage).toEqual("3474 726536 51920");
        input.takeScreenshot();
      });
    */

});

