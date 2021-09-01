// Gulp 4 Common JS
// Author: Funnydino. funnydino1@gmail.com
// Шрифты должны быть в виде: *FontFamily-FontWeightFontStyle.ttf*

const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');

const fs = require('fs');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const fileInclude = require('gulp-file-include');
const htmlMin = require('gulp-htmlmin');
const image = require('gulp-image');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const revdel = require('gulp-rev-delete-original');
const revRewrite = require('gulp-rev-rewrite');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff2 = require('gulp-ttf2woff2');
const uglify = require('gulp-uglify-es').default;
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

// Production version:

// Fonts:

const fonts = () => {
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/fonts/'))
};

const fontWeightCalc = (str) => {
  let weight;
  switch (true) {
    case /thin/.test(str) || /hairline/.test(str):
      weight = 100;
      break;
    case /extralight/.test(str) || /ultralight/.test(str):
      weight = 200;
      break;
    case /light/.test(str):
      weight = 300;
      break;
    case /normal/.test(str) || /regular/.test(str):
      weight = 400;
      break;
    case /medium/.test(str):
      weight = 500;
      break;
    case /semibold/.test(str) || /demibold/.test(str):
      weight = 600;
      break;
    case /bold/.test(str):
      weight = 700;
      break;
    case /extrabold/.test(str) || /ultrabold/.test(str):
      weight = 800;
      break;
    case /black/.test(str) || /heavy/.test(str):
      weight = 900;
      break;
    case /extrablack/.test(str) || /ultrablack/.test(str):
      weight = 950;
      break;
    default:
      weight = 400;
  }
  return weight;
};

const fontStyleCalc = (str) => {
  return str.includes('italic') ? 'italic' : 'normal';
};

const cb = () => {};

const srcFonts = './src/scss/_fonts.scss';
const appFonts = './app/fonts/';

const fontsStyle = (done) => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, '', cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        let fontfamily = fontname[0].split('-');
        let fontInfo = fontfamily[1].toLowerCase();
        fontweight = fontWeightCalc(fontInfo);
        fontstyle = fontStyleCalc(fontInfo);
        fontname = fontname[0];
        fontfamily = fontfamily[0];
        if (c_fontname != fontname) {
          fs.appendFile(srcFonts, '@include font-face("' + fontfamily + '", "' + fontname + '", ' + fontweight + ', "' + fontstyle + '");\r\n', cb);
        }
        c_fontname = fontname;
      };
    };
  });

  done();
};

// Styles:

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2,
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream())
};

// HTML (только собирает .html-файл):

const html = () => {
  return src(['./src/*.html'])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file',
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream())
};

// Images:

const images = () => {
  return src(['./src/img/**/*.jpg', './src/img/**/*.jpeg', './src/img/**/*.png', './src/img/**.svg'])
    .pipe(dest('./app/img'))
};

// SVG Sprite:

const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('./app/img'))
};

// Scripts:

const scripts = () => {
  return src('./src/js/main.js')
    .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        }]
      }
    }))
    .on('error', (err) => {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })
    .pipe(sourcemaps.init())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream())
};

// Перенос файлов из папки 'resources' в папку 'app':

const resources = () => {
  return src('./src/resources/**')
    .pipe(dest('./app'))
};

// Удаление папки 'app':

const clean = () => {
  return del(['./app/*'])
};

// BrowserSync (Наблюдение (слежение) за файлами):

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: './app',
    },
  });
  watch('./src/scss/**/*.scss', styles);
  watch('./src/*.html', html);
  watch('./src/html/*.html', html);
  watch('./src/img/**/*.jpg', images);
  watch('./src/img/**/*.jpeg', images);
  watch('./src/img/**/*.png', images);
  watch('./src/img/**.svg', images);
  watch('./src/img/svg/**.svg', svgSprites);
  watch('./src/resources/**', resources);
  watch('./src/fonts/**.ttf', fonts);
  watch('./src/fonts/**.ttf', fontsStyle);
  watch('./src/js/**/*.js', scripts)
};

exports.clean = clean;
exports.fonts = fonts;
exports.styles = styles;
exports.html = html;
exports.images = images;
exports.svgSprites = svgSprites;
exports.resources = resources;
exports.watchFiles = watchFiles;

exports.default = series(clean, parallel(html, scripts, fonts, images, svgSprites, resources), fontsStyle, styles, watchFiles);

// Build version:

// HTML (собирает .html-файл и минифицирует его):

const htmlBuild = () => {
  return src(['./src/*.html'])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file',
    }))
    .pipe(htmlMin({
      collapseWhitespace: true,
    }))
    .pipe(dest('./app'))
};

// Styles:

const stylesBuild = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2,
    }))
    .pipe(dest('./app/css/'))
};

// Scripts:

const scriptsBuild = () => {
  return src('./src/js/main.js')
    .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        }]
      }
    }))
    .on('error', (err) => {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })
    .pipe(uglify({
      toplevel: true,
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(dest('./app/js'))
};

// Images:

const imagesBuild = () => {
  return src(['./src/img/**/*.jpg', './src/img/**/*.jpeg', './src/img/**/*.png', './src/img/**.svg'])
    .pipe(image())
    .pipe(dest('./app/img'))
};

exports.build = series(clean, parallel(htmlBuild, scriptsBuild, fonts, imagesBuild, svgSprites, resources), fontsStyle, stylesBuild);

// Cache:

const cache = () => {
  return src('./app/**/*.{css,js,svg,png,jpg,jpeg,woff2}', {
      base: 'app'
    })
    .pipe(rev())
    .pipe(revdel())
    .pipe(dest('app'))
    .pipe(rev.manifest('rev.json'))
    .pipe(dest('app'));
};

const rewrite = () => {
  const manifest = fs.readFileSync('./app/rev.json');
  return src('./app/**/*.html')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest('app'))
};

exports.cache = series(cache, rewrite);