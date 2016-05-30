exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./payFields/tests/e2e/*.js'],
  multiCapabilities: [{
    browserName: 'firefox'
  }, {
    browserName: 'chrome'
  }]
};