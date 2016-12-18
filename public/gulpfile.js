var gulp = require('gulp'),
    watch = require('gulp-watch'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;


gulp.task('serve', ['html','less','scripts'], function() {
    // browserSync.init({
    // 	server: "./dest"
    // });
    gulp.watch("./src/*.html", ['html']);
    gulp.watch("./src/*/*.less", ['less']);
    gulp.watch("./src/*/*.js", ['scripts']);
    // gulp.watch("./dest/*.html").on('change', reload);
});

gulp.task('scripts', function() {
    return gulp.src('./src/*/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('./dest/js'))
        .pipe(reload({stream: true}));
});

gulp.task('less', function() {
    return gulp.src('./src/*/*.less')
        .pipe(less())
        .pipe(autoprefixer({
           browsers: ['last 2 versions','Firefox >= 20', 'safari 5'],
           cascade: true, 
           remove: true
        }))
        .pipe(gulp.dest('./dest/css'))
        .pipe(reload({stream: true}));
});

gulp.task('html', function() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./dest'))
        .pipe(reload({stream: true}));
})

gulp.task('default', ['serve']);
