/* eslint-env mocha */

var fs = require('vinyl-fs')
var File = require('vinyl')
var through = require('through2')
var chai = require('chai')
var chaiGulpHelpers = require("chai-gulp-helpers")
var lcovResultMerger = require('../index.js')

chai.should()
chai.use(chaiGulpHelpers)

describe('lcovResultMerger', function () {
  it('should combine the given records into one', function () {
    var expected = fs.src('./test/expected/basic/lcov.info')
    var actual = fs.src('./test/fixtures/basic/*/lcov.info')
      .pipe(lcovResultMerger())
    return actual.should.produce.sameFilesAs(expected)
  })

  it('should ignore null files', function (callback) {
    var stream = lcovResultMerger()
    stream.on('data', function (file) {
      file.contents.toString().should.equal('')
      callback()
    })
    stream.write(new File({
      path: '/meow.html',
      contents: null
    }))
    stream._flush()
  })

  it('should throw an error if streaming is attempted', function () {
    var stream = lcovResultMerger()
    void function () {
      stream.write(new File({
        path: '/foo.html',
        contents: through.obj()
      }))
    }.should.throw('Streaming not supported')
  })

  it('should handle a record with : in the name', function () {
    var expected = fs.src('./test/expected/windows/lcov.info')
    var actual = fs.src('./test/fixtures/windows/lcov.info')
      .pipe(lcovResultMerger())
    return actual.should.produce.sameFilesAs(expected)
  })
})
