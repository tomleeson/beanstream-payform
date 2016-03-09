describe('greeter', function () {

	var defaultFormat = /(\d{1,4})/g;
    var cards = [{
	      type: 'visaelectron',
	      patterns: [4026, 417500, 4405, 4508, 4844, 4913, 4917],
	      format: defaultFormat,
	      length: [16],
	      cvcLength: [3],
	      luhn: true
	    }, {
	      type: 'maestro',
	      patterns: [5018, 502, 503, 56, 58, 639, 6220, 67],
	      format: defaultFormat,
	      length: [12, 13, 14, 15, 16, 17, 18, 19],
	      cvcLength: [3],
	      luhn: true
	    }];

  it('should get card type', function () {

    expect(validate.getCardType(5018, cards)).toEqual('maestro');
  });

  it('should pass valid luhn number', function () {

    expect(validate.getLuhnChecksum('1234567890123452')).toBe(true);
  });

  it('should fail invalid luhn number', function () {

    expect(validate.getLuhnChecksum('1234567890123451')).toBe(false);
  });

  it('should add space before 5th chars onKwydown', function () {

  	expect(validate.formatCardNumber_onKeydown('123', '4')).toBe('1234');
  	expect(validate.formatCardNumber_onKeydown('1234', '5')).toBe('1234 5');
    expect(validate.formatCardNumber_onKeydown('1234 5678', '9')).toBe('1234 5678 9');
    // formatCardNumber_onPaste
  });

  it('should add space every 4th char onPaste', function () {

    expect(validate.formatCardNumber_onPaste('123456789')).toBe('1234 5678 9');
    expect(validate.formatCardNumber_onPaste('1 234  56789')).toBe('1234 5678 9');
  });

});
