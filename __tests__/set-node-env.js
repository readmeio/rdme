// Chalk has trouble with Jest sometimes in test snapshots so we're disabling colorization here for all tests.
process.env.FORCE_COLOR = 0;

process.env.NODE_ENV = 'testing';
