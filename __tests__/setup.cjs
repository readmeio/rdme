// The `chalk` and `colors` libraries have trouble with Jest sometimes in test snapshots so we're disabling
// colorization here for all tests.
// https://github.com/chalk/supports-color/issues/106
process.env.FORCE_COLOR = 0;

// Sets our test NODE_ENV to a custom value in case of false positives
// if someone is using this tool in a testing environment
process.env.NODE_ENV = 'rdme-test';
