// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  multiCapabilities: [
    {'browserName': 'chrome'}
    //,{'browserName': 'firefox'}
    //,{'browserName': 'safari'}
  ],


  maxSessions: 1,
  specs: ['spec.js']
}


/*
MAnual configuration needed for Safari

// https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/7933

To manually install the latest Safari extension (2.43.1): 
- Download Safari Driver jar from here:
http://central.maven.org/maven2/org/seleniumhq/selenium/selenium-safari-driver/2.43.1/selenium-safari-driver-2.43.1.jar
- Unzip it. 
- In Finder, go to ../selenium-safari-driver-2.43.1/org/openqa/selenium
- Double click "SafariDriver.safariextz"
*/