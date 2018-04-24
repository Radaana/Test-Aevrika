'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-cleancss');
const autoprefixer = require('gulp-autoprefixer');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const cheerio = require('gulp-cheerio'); //This is a plugin for gulp which allows you to manipulate HTML and XML files using cheerio.

const svgSprite = require('gulp-svg-sprite'); 
const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin'); //Minify PNG, JPEG, GIF and SVG images with imagemin

const spritesmith = require('gulp.spritesmith');  //Convert a set of images into a spritesheet and CSS variables via gulp
const buffer = require('vinyl-buffer'); // An alternative to gulp-streamify that you can pipe to, instead of being required to wrap your streams.
const merge = require('merge-stream'); //Merge (interleave) a bunch of streams.

const pug = require('gulp-pug'); // PUG

// Пути 

const paths =  {
  src: './src/',              // paths.src
  build: './build/'           // paths.build
};

const images = 
  // paths.src + '/img/*.{gif,png,jpg,jpeg,ico}'
  paths.src + '/img/*.{gif,png,jpg,jpeg,ico,svg}'
  // paths.src + '/blocks/**/img/*.{gif,png,jpg,jpeg,svg}',
  // '!' + paths.src + '/blocks/sprite-png/png/*',
  // '!' + paths.src + '/blocks/sprite-svg/svg/*',
;

const fonts = 
  paths.src + '/fonts/*.{otf,ttf,woff,woff2}';

// задачи

function styles() { // CSS
  return gulp.src(paths.src + 'scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass()) // { outputStyle: 'compressed' }
    .pipe( autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
        }))
    .pipe(groupMediaQueries())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(paths.build + 'css/'))
}

function scripts() { //JS
  return gulp.src(paths.src + 'js/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest(paths.build + 'js/'))
}

function scriptsCopy() { //JS
  // return gulp.src(paths.src + 'js/**/*.{js, vue}')
  return gulp.src(paths.src + 'js/libs/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    // .pipe(concat('script.min.js'))
    .pipe(gulp.dest(paths.build + 'js/'))
}

function htmls() { //HTML
  return gulp.src(paths.src + '*.html')
    .pipe(plumber())
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest(paths.build));
}

function pugs() {  // PUG
  return gulp.src([
    paths.src + '*.pug' 
    // '!' + dirs.source + '/mixins.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    // .pipe(htmlbeautify())
    .pipe(gulp.dest(paths.build));
};


function copyImg() { //IMG
  if(images.length) {
    return gulp.src(images)
      // .pipe(imagemin()) //minify images
      // .pipe(newer(dirs.build + '/img')) // потенциально опасно, к сожалению
      // .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(paths.build + '/img'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
};

function copyFonts() { //FONTS
  if(fonts.length) {
    return gulp.src(fonts)
      .pipe(gulp.dest(paths.build + '/fonts'));
  }
  else {
    console.log('Шрифты не обрабатываются.');
    callback();
  }
};

function svgSpriteBuild() { //SVG Sprite
  return gulp.src(paths.src + 'icons/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg",
          render: {
            scss: {
              dest: paths.src + '../_sprite.scss',
              template: paths.src + "scss/templates/_sprite_template.scss"
            }
          }
        }
      }
    }))
    .pipe(gulp.dest(paths.build + 'img/'));
};



let spritePngPath = paths.src + '/png-sprite/';
// gulp.task('sprite:png', function () {
function pngSpriteBuild() { //PNG Sprite
  let fileName = 'sprite-png.png';
  let spriteData = gulp.src(spritePngPath + '*.png')
    .pipe(plumber())
    .pipe(spritesmith({
      imgName: fileName,
      cssName: 'sprite-png.scss',
      padding: 4,
      imgPath: '../img/' + fileName
    }));
  let imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.src + '/img/'));
  let cssStream = spriteData.css
    .pipe(gulp.dest(paths.src + '/scss/'));
  return merge(imgStream, cssStream);
};




function clean() {
  return del('build/')
}

function watch() {
  gulp.watch(paths.src + 'scss/**/*.scss', styles);
  gulp.watch(paths.src + 'js/*.js', scripts);
  gulp.watch(paths.src + 'js/libs/*.js', scriptsCopy);
  gulp.watch(paths.src + '*.html', htmls);
  gulp.watch(paths.src + '*.pug', pugs);
  gulp.watch(paths.src + 'icons/*.svg', svgSpriteBuild);
  gulp.watch(paths.src + 'png-sprite/*.png', pngSpriteBuild);
  gulp.watch(paths.src + 'img/*.{gif,png,jpg,jpeg,svg,ico}', copyImg);
  gulp.watch(paths.src + '/fonts/*.{otf,ttf,woff,woff2}', copyFonts);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: paths.build
    }
  });
  browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

// Сборка

exports.styles = styles;
exports.scripts = scripts;
exports.scriptsCopy = scriptsCopy;
exports.htmls = htmls;
exports.pugs = pugs;
exports.clean = clean;
exports.watch = watch;
exports.copyImg = copyImg;
exports.copyFonts = copyFonts;
exports.svgSpriteBuild = svgSpriteBuild;
exports.pngSpriteBuild = pngSpriteBuild;


gulp.task('build', gulp.series(
  clean,
  styles,
  scripts,
  scriptsCopy,
  htmls,
  pugs,
  svgSpriteBuild,
  pngSpriteBuild,
  copyImg
  // gulp.parallel(styles, scripts, htmls)
));

gulp.task('default', gulp.series(
  clean,
  // gulp.parallel(svgSpriteBuild, pngSpriteBuild),
  gulp.parallel(svgSpriteBuild, pngSpriteBuild),
  gulp.parallel(styles, scripts, scriptsCopy, htmls, pugs),
  gulp.parallel(copyImg, copyFonts),
  gulp.parallel(watch, serve)
));
