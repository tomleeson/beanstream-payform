describe('Validator', function () {

	var defaultFormat = /(\d{1,4})/g;

  it('should get card type', function () {

    expect(beanstream.Validator.getCardType('5018')).toEqual('maestro');
  });

  it('should pass valid luhn number', function () {

    expect(beanstream.Validator.getLuhnChecksum('1234567890123452')).toBe(true);
  });

  it('should fail invalid luhn number', function () {

    expect(beanstream.Validator.getLuhnChecksum('1234567890123451')).toBe(false);
  });

  it('should format string by adding white spaces onKwydown', function () {

  	expect(beanstream.Validator.formatCardNumber('1234')).toBe('1234');
  	expect(beanstream.Validator.formatCardNumber('12345')).toBe('12345'); // Unknown card
    expect(beanstream.Validator.formatCardNumber('525937661')).toBe('5259 3766 1'); // mastercard
    expect(beanstream.Validator.formatCardNumber('34747265365192099')).toBe('3474 726536 51920'); // amex
  });

  it('should reject expired dates', function () {

    //JavaScript counts months from 0 to 11
    //'01/2016' = Jan, Date(2016, 1) = Feb
    expect(beanstream.Validator.isValidExpiryDate('01/16', new Date(2016, 1))).toBe(false);
  });

   it('should accept valid dates', function () {

    //'02/2016' = Feb, Date(2016, 1) = Feb
    expect(beanstream.Validator.isValidExpiryDate('02/16', new Date(2016, 1))).toBe(true);
    //'04/2016' = Apr, Date(2016, 2) = Mar
    expect(beanstream.Validator.isValidExpiryDate('04/16', new Date(2016, 2))).toBe(true);
  });




});

//useful: list of card no's for testing: http://www.freeformatter.com/credit-card-number-generator-validator.html
