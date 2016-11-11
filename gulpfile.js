var gulp = require('gulp');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');

// task
gulp.task('default', function () {
    gulp.src('./logger.js') // path to your files
    .pipe(rename('logger.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});
