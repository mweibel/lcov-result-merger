# Changelog

## [6.0.0](https://github.com/mweibel/lcov-result-merger/compare/v6.0.0-rc.0...v6.0.0) (2026-04-29)

### ⚠ BREAKING CHANGES

* drop support for Node before v20
* drop explicit support for Node 14

### Features

* add support for FN and FNDA records in LCOV merging and reporting ([#60](https://github.com/mweibel/lcov-result-merger/issues/60)) ([a56ff87](https://github.com/mweibel/lcov-result-merger/commit/a56ff87f6589986919c3f70f1aaa1df94f32c0bc))
* drop explicit support for Node 14 ([13c1905](https://github.com/mweibel/lcov-result-merger/commit/13c19058af07a16507aa5e6afb64bddcd75f7978))
* drop support for Node before v20 ([afbbdc0](https://github.com/mweibel/lcov-result-merger/commit/afbbdc060b46cd87c77fe713c2a2d4bc545e4990))

## [6.0.0-rc.0](https://github.com/mweibel/lcov-result-merger/compare/v5.0.1...v6.0.0-rc.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* remove temp file creation and usage

### Features

* introduce --log argument ([4be3ca6](https://github.com/mweibel/lcov-result-merger/commit/4be3ca6ca11b7d6b99271c543db7fefccfc3d0e4))
* remove temp file creation and usage ([63e591a](https://github.com/mweibel/lcov-result-merger/commit/63e591af4b3bfbfc765793454b2802097a76885c))

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
