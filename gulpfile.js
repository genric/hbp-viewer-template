var gulp = require('gulp');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var expect = require('gulp-expect-file');
var uglify = require('gulp-uglify');
var minify = require('gulp-clean-css');
var concat = require('gulp-concat');
var del = require('del');
var connect = require('gulp-connect');
var rev = require('gulp-rev');
var rename = require('gulp-rename');
var handlebars = require('gulp-compile-handlebars');
var gutil = require('gulp-util');
var environments = require('gulp-environments');
var os = require('os');
var fs = require("fs");

var homeDir = os.homedir();
var development = environments.development;
var production = environments.production;

var srcJs = ['src/js/**/*.js'];
var libBower = ['bower_components/jquery/dist/jquery.js',
                'bower_components/dat-gui/build/dat.gui.js',
                'bower_components/notifyjs/dist/notify.js',
                'bower_components/three.js/build/three.js',
                'bower_components/three.js/examples/js/controls/TrackballControls.js',
                'bower_components/lodash/lodash.js',
                'bower_components/bbp-oidc-client/bbp-oidc-client.js'];
var srcScss = ['src/scss/main.scss'];

gulp.task('connect', ['build-html', 'watch'], function() {
  connect.server({
    root: 'dist',
    // https: {
    //   key: fs.readFileSync(homeDir + '/.ssl/server.key'),
    //   cert: fs.readFileSync(homeDir + '/.ssl/server.crt'),
    // },
    // livereload: true
  });
});

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('lint-scss', function() {
  return gulp.src(srcScss)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});

gulp.task('build-scss', ['lint-scss'], function() {
  return gulp.src(srcScss)
    .pipe(expect(srcScss))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('app.css'))
    .pipe(production(minify()))
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(connect.reload())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest({ merge:true }))
    .pipe(gulp.dest('./'));
});

gulp.task('lint-js', function () {
  return gulp.src(srcJs)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build-js', ['lint-js'], function() {
  return gulp.src(libBower.concat(srcJs))
    .pipe(expect(srcJs.concat(libBower)))
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(production(uglify()))
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(connect.reload())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest({ merge:true }))
    .pipe(gulp.dest('./'));
});

gulp.task('build-html', ['build-js', 'build-scss'], function() {
  var manifest = JSON.parse(fs.readFileSync('./rev-manifest.json'));
  var handlebarOpts = {
    helpers: {
      assetPath: function (path, context) {
        return context.data.root[path];
      }
    }
  };
  return gulp.src('src/html/index.hbs')
    .pipe(handlebars(manifest, handlebarOpts))
    .pipe(rename('index.html'))
    .pipe(connect.reload())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch(['src/html/**/*.hbs'], ['build-html']);
  gulp.watch(['src/scss/**/*.scss'], ['build-html']);
  gulp.watch(['src/js/**/*.js'], ['build-html']);
});

gulp.task('default', ['build-html']);
