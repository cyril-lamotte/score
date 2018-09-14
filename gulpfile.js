'use strict';

/**
  * Usage :
  *
  * `gulp`         : Lancer l'écoute des répertoires et les compilations.
  * `gulp clean`   : Supprimer les fichiers générés automatiquement.
  * `gulp archive` : Générer une archive zip du répertoire.
  * `gulp deploy`  : Déployer les sources par FTP.
  * `gulp prod`    : Génerer les fichier compressés.

  * Test de régressions visuelles :
  * `gulp bs_ref`  : Créer un jeu de référence.
  * `gulp bs_test` : Comparer avec la référence.
  * `gulp bs_approve` : Le dernier test devient la référence.
  */


/* =============================================================================
   Configuration
============================================================================= */

// Project.
var project = {
  env: 'dev',
  namespace: 'mockup',
  ftpPath:   '/',
};

// Paths.
var paths = {
  scss:         'sources/scss/',
  sprites:      'sources/img-sprites/',
  html:         'sources/html/',
  fonts_src:    'sources/fonts/',
  img_src:      'sources/img/',
  js_src:       'sources/js/',
  data_src:     'sources/data/',
  root:         'sources/root/',

  dist:         'dist/',
  js:           'dist/assets/js/',
  css:          'dist/assets/css/',
  img:          'dist/assets/img/',
  fonts:        'dist/assets/fonts/',
  data:         'dist/data/'
};

try {

  // Packages
  var gulp             = require('gulp'),                // gulp core.
      $                = require('gulp-load-plugins')(), // Automatic plugins loads.
      del              = require('del'),                 // Remove files.
      sass             = require('gulp-sass'),           // Compile SASS code.
      jshint           = require('gulp-jshint'),         // JS Code quality.
      stylelint        = require('gulp-stylelint'),      // CSS code quality.
      ignore           = require('gulp-ignore'),         // Exclude files.
      postcss          = require('gulp-postcss'),        // Post CSS features.
      autoprefixer     = require('autoprefixer'),        // Add browsers prefix.
      sourcemaps       = require('gulp-sourcemaps'),     // Generate SASS sourcemap.
      spritesmith      = require('gulp.spritesmith'),    // Generate sprites.
      fileinclude      = require('gulp-file-include'),   // HTML includes.
      cleanCSS         = require('gulp-clean-css'),      // Minify CSS.
      minify           = require('gulp-minify'),         // Minify JS.
      imagemin         = require('gulp-imagemin'),       // Images optimisation.
      rename           = require("gulp-rename"),         // Rename files.
      concat           = require('gulp-concat-util'),    // Concat files.
      sftp             = require('gulp-sftp'),           // SFTP.
      sassGlob         = require('gulp-sass-glob'),      // SASS glob.
      exec             = require('gulp-exec'),           // Execute commands.
      backstop         = require('backstopjs')           // Visual comparaison.

  var browserSync = require('browser-sync').create();

} catch(err) {
  console.log('>> ' + err.message);

  return;
}




// Errors managment
var onError = function(err) {
  console.log(err.message);
  this.emit('end');
};


/* =============================================================================
   Build tasks
============================================================================= */

/**
  * Build CSS
  *
  * Compilation SASS
  * Génération des sourcemaps
  * Autoprefixer
  */
gulp.task('build-css', function() {

  console.log('');
  console.log('');

  return gulp.src(paths.scss + '**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .on('error', onError)
    .pipe(postcss([autoprefixer({ browsers: ['last 3 versions', '> 1%'] })]))
    .pipe(postcss([require('postcss-normalize')()]))
    .pipe(sourcemaps.write('../../sources/maps'))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());

});


/**
  * Minify CSS
  */
gulp.task('minify-css', ['build-css'], function() {

  return gulp.src([
      paths.css + 'common.css',
      paths.css + 'features.css'
    ])
    .pipe(cleanCSS({compatibility: '*'}, function(details) {
       console.log(details.name + ': ' + Math.round(details.stats.originalSize/1024) + 'ko >> min : ' + Math.round(details.stats.minifiedSize/1024) + 'ko');
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(paths.css));

});


/**
  * Concat JS
  */
gulp.task('concat', function() {

  gulp.src([
    paths.js_src + 'score.config.js',
    paths.js_src + 'score.db.js',
    paths.js_src + 'score.ui.js',
    paths.js_src + 'score.players.js',
    paths.js_src + 'score.js'
  ])
    .pipe(concat('scripts.js'))
    .pipe(minify({
      ext: {
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest(paths.js));

});


/**
  * Build HTML
  */
gulp.task('build-html', function() {

  gulp.src([
      paths.html + '**/*.html',
      '!' + paths.html + 'includes/**/*.html'
    ])
    .pipe(fileinclude({
      prefix: '<!-- @@',
      suffix: '-->',
      basepath: '@file',
      indent: true,
      context: {
        env: project.env
      }
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.stream());

});


// Build sprites.
gulp.task('sprites', function () {

  var spriteData = gulp.src(paths.sprites + '*.png')
      .pipe(spritesmith({
        /* this whole image path is used in css background declarations */
        imgName: '../img/sprites.png',
        imgPath: '../img/sprites.png',
        //retinaImgName: '../img/sprite@2x.png',
        //retinaSrcFilter: ['sources/sprites/*@2x.png'],
        cssName: '_sprites.scss',
        padding: 5,
        cssOpts: {functions: false}
    }));

  spriteData.img.pipe(gulp.dest(paths.img));
  spriteData.css.pipe(gulp.dest(paths.scss + 'abstract/variables'));
});


// Copy statics ressources.
gulp.task('statics', function() {

  // Copy statics images.
  gulp.src(paths.img_src + '**')
    .pipe(gulp.dest(paths.img));

  // Copy statics scripts.
  gulp.src(paths.js_src + '**')
    .pipe(gulp.dest(paths.js));

  // Copy statics fonts.
  gulp.src(paths.fonts_src + '**')
    .pipe(gulp.dest(paths.fonts));

  // Copy statics data.
  gulp.src(paths.root + '**')
    .pipe(gulp.dest(paths.dist));

  return;

});

// Optimize & copy images.
gulp.task('images', function() {

 return gulp.src(paths.img_src + '**')
    .pipe(imagemin([
      imagemin.gifsicle(), imagemin.jpegtran(), imagemin.optipng(), imagemin.svgo()
    ], {
      'verbose' : false
    }))
    .pipe(gulp.dest(paths.img));

});

// Copy data ressources.
gulp.task('data', function() {

  // Copy data.
  return gulp.src(paths.data_src + '**')
    .pipe(gulp.dest(paths.data));

});



/* =============================================================================
   Lint
============================================================================= */

// SCSS
gulp.task('lint-css', ['build-css'], function lintCssTask() {

  return gulp
    .src(paths.scss + '**/*.scss')
    .pipe(ignore.exclude('**/_sprites.scss'))
    .pipe(stylelint({
      syntax: 'scss',
      fix: true,
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});


// JS.
gulp.task('jshint', function() {
  return gulp.src(paths.js_src + '**/*.js')
    .pipe(ignore.exclude('**/lib/*.js'))
    .pipe(ignore.exclude('**/plugins/contrib/*.js'))
    .pipe(ignore.exclude('**/*.min.js'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


/* =============================================================================
   Server
============================================================================= */

// Static server.
gulp.task('browser-sync', function() {
  browserSync.init({
    open: false,
    server: {
      baseDir: paths.dist
    },
    ui: false
  });
});


/* =============================================================================
   Others
============================================================================= */

// Build Zip.
gulp.task('archive', function () {

  var now = new Date(),
      date = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + '__' + ('0' + (now.getHours())).slice(-2) + 'h' + ('0' + (now.getMinutes())).slice(-2),
      zipName = date + '__' + project.namespace + '.zip';

  console.log(zipName);

  return gulp.src(['./**/', '!./node_modules/**', '!./node_modules'])
    .pipe($.zip(zipName))
    .pipe(gulp.dest('./'));
});

// Remove files for a fresh start.
gulp.task('clean', function() {
  return del([
    'dist/',
    'backstop/'
  ]);
});


// Remove files for a fresh start.
gulp.task('deploy', function() {

  return gulp.src(paths.dist + '/**')
    .pipe(sftp({
      host:     '',
      user:     '',
      password: '',
      remotePath: project.ftpPath
    }));

});


gulp.task('bs_ref', () => backstop('reference'));
gulp.task('bs_test', () => backstop('test'));
gulp.task('bs_approve', () => backstop('approve'));




/* =============================================================================
   Default & watch
============================================================================= */

// Init.
gulp.task('start', ['statics', 'images', 'sprites', 'build-css', 'build-html', 'minify-css', 'concat', 'lint-css', 'data', 'browser-sync']);

// Watch.
gulp.task('watch', function() {

  // Copy JS & fonts.
  gulp.watch([
    paths.fonts_src + '**/*',
    paths.img_src + '**/*',
    paths.js_src + '**/*.js',
    paths.root + '**/*',
  ], ['images', 'statics']);

  gulp.watch([paths.html + '**/*.html', '!' + paths.html + '**/*Copie.html'], ['build-html']);
  gulp.watch(paths.scss + '**/*.scss', ['build-css', 'minify-css', 'lint-css']);


  gulp.watch(paths.js_src + '**/*.js', ['jshint', 'concat']);
  gulp.watch(paths.sprites + '*.png', ['sprites']);
});


// Define the default task.
gulp.task('default', ['start', 'watch']);

// Generate prod.
gulp.task('init-prod', function() {
  project.env = 'prod';
});


// Generate prod.
gulp.task('prod', ['init-prod', 'start', 'watch']);
