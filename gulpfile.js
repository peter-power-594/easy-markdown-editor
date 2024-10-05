'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');

var banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link https://github.com/ionaru/easy-markdown-editor',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


var css_files = [
    './node_modules/codemirror/lib/codemirror.css',
    './src/css/*.css',
    './node_modules/codemirror-spell-checker/src/css/spell-checker.css',
];

function lint() {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function scripts() {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.js'))
        .pipe(gulp.dest('./dist/'));
}

function scripts2() {
    return gulp.src('./dist/easymde.js')
        .pipe(buffer())
        .pipe(terser())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(rename('easymde.min.js'))
        .pipe(gulp.dest('./dist/'));
}

function styles() {
    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
        .pipe(cleanCSS())
        .pipe(rename('easymde.min.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

// Watch for file changes
function watch() {
    gulp.watch('./src/js/**/*.js', gulp.series(scripts, scripts2));
    gulp.watch(css_files, styles);
}

var build = gulp.parallel(gulp.series(lint, scripts, scripts2), styles);

gulp.task('default', build);
gulp.task('watch', gulp.series(build, watch));
gulp.task('lint', lint);
