process.env.NODE_ENV = 'testing';

// Jest snapshots lose their marbles a bit here with the combinatin of `colors` and `table-layout` where sometimes
// `table-layout` breaks lines sooner than it should be because Jest's environment isolation causes `colors` to
// not enable colors because it doesn't think it's available.
//
// Instead of messing with all that we're just forcing `colors` to not use colors in tests.
process.env.FORCE_COLOR = 0;
