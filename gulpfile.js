var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('jshint', function () {
	return gulp.src(['index.js', 'bin/lcov-result-merger.js',
		'gulpfile.js', 'test/*.js'])
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(jshint.reporter('fail'))
			.on('error', function (error){
				throw error;
			});
});

gulp.task('mocha', function (callback) {
	gulp.src(['./index.js', './lib/**/*.js'])
		.pipe(istanbul())
		.on('finish', function () {
			gulp.src(['test/*.js'])
				.pipe(mocha({
					reporter: 'spec'
				}))
				.pipe(istanbul.writeReports())
				.on('end', callback);
		});
});

gulp.task('test', ['jshint', 'mocha']);
