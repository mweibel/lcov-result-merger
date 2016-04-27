# Contributing Guidelines

## Getting started

Fork the repository to your own account and clone it to a location on your local machine.
Install the necessary dependencies and run the tests to make sure everything works.

```
$ npm install
$ npm test
```

## Feature requests / Bug reports
Please use [GitHub issues on the lcov-result-merger repository](https://github.com/mweibel/lcov-result-merger/issues)
for feature requests and bug reports.

I'd like to invite you to help me working on the code so if you feel something should be implemented, please open a pull request.

## Pull requests
lcov-result-merger uses [semantic-release](https://github.com/semantic-release/semantic-release) for automatic releases from master
which determines the version number based on the commit messages and their annotations. To do so, any commit message you
create for a pull request needs to follow the [AngularJS commit message guideliens](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit).
The easiest way to do that is by using [the commitizen conventions CLI](http://commitizen.github.io/cz-cli/).

Please test the code you change and make sure the tests pass before submitting a pull request.
