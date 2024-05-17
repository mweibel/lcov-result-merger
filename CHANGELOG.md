

## [5.0.1](https://github.com/mweibel/lcov-result-merger/compare/v5.0.0...v5.0.1) (2024-05-17)


### Bug Fixes

* copy the merge result file out of the temp directory, instead of trying to move it ([dcafe09](https://github.com/mweibel/lcov-result-merger/commit/dcafe09dd0ba805dd248c25c58b2eb0db8158ac9)), closes [/github.com/mweibel/lcov-result-merger/issues/58#issuecomment-1836915866](https://github.com/mweibel//github.com/mweibel/lcov-result-merger/issues/58/issues/issuecomment-1836915866)

## [5.0.0](https://github.com/mweibel/lcov-result-merger/compare/v5.0.0-rc.0...v5.0.0) (2023-11-20)


### Features

* provide ts libdefs ([246c7c6](https://github.com/mweibel/lcov-result-merger/commit/246c7c699b3102437691c5fff2805b01b663835c))

## [5.0.0-rc.0](https://github.com/mweibel/lcov-result-merger/compare/v4.1.0...v5.0.0-rc.0) (2023-07-06)


### ⚠ BREAKING CHANGES

* shift internals from Streams to Promises
* use host system temp directory for transient lcov.info file

### Features

* use host system temp directory for transient lcov.info file ([3c713f1](https://github.com/mweibel/lcov-result-merger/commit/3c713f1be01f6c080cc2c0db7b75ea21eb4e0253))


### Bug Fixes

* subclass stream Transform since node 14 simplified construction does not offer "construct" ([d9c14b6](https://github.com/mweibel/lcov-result-merger/commit/d9c14b6dc5f043499e4f8669a754e6877ebd27df))


### Code Refactoring

* shift internals from Streams to Promises ([0cbfa42](https://github.com/mweibel/lcov-result-merger/commit/0cbfa42cf860a9a7138d9b1febc20ee1c1c67651))