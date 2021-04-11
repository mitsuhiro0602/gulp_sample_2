const {src, dest, watch, series, parallel } = require('gulp');
const loadPlugins = require('gulp-load-plugins');
// const pug = require( 'gulp-pug' );
const $ = loadPlugins();
const pkg = require('./package.json');
const replace = require( 'gulp-replace' );
const convertEncoding = require( 'gulp-convert-encoding' );
const conf = pkg["gulp-config"];
const sizes = conf.sizes;
const plumber = require("gulp-plumber");
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');
const server = browserSync.create();
const isProd = process.env.NODE_ENV === "production";


function icon(done) {
    for(let size of sizes){
        let width = size[0]
        let height = size[1]
        src('./favicon.png')
        .pipe($.imageResize({
            width,
            height,
            crop: true,
            upscale: false
        }))
        .pipe($.imagemin())
        .pipe($.rename(`favicon-${width}x${height}.png`))
        .pipe(dest('./dist/image/icon'));
    }
    done();
}

function copyFiles(){
    // return src('./src/index.html', './src/sample.html')
    // return src('./src/*.html')
    return src('./src/**/*.html')
        .pipe(dest('./dist'));
}

function pug(){
    // return src('./src/pug/*.pug', '!./src/pug/**/_*.pug')
    return src('./src/pug/*.pug')
        .pipe(plumber())
        .pipe($.pug({
            pretty: true
        }))
        .pipe(replace('Shift_JIS', 'UTF-8'))
        .pipe(convertEncoding({to: 'UTF-8'}))
        .pipe(dest('./dist'));
}

function styles(){
    return src('./src/sass/*.scss', '!./src/sass/**/_*.scss')
        .pipe($.if(!isProd, $.sourcemaps.init()))
        .pipe(plumber())
        .pipe($.sass())
        .pipe($.postcss([
            autoprefixer()
        ]))
        .pipe($.if(!isProd,$.sourcemaps.write('.')))
        .pipe(dest('./dist/css'));
}

function scripts() {
    return src('./src/js/*.js')
        .pipe($.if(!isProd, $.sourcemaps.init()))
        .pipe($.babel())
        .pipe($.if(!isProd, $.sourcemaps.write('.')))
        .pipe(dest('./dist/js'));
}

function lint() {
    return src('./src/js/*.js')
        .pipe($.eslint({ fix: true }))
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError())
        .pipe(dest('./src/js'))
}

function startAppServer(){
    server.init({
        server: {
            baseDir: './dist'
        }
    });
    // watch('./src/pug/*.pug', pug);
    // watch('./src/pug/*.pug', pug).on('change', server.reload);
    watch('./src/**/*.scss', styles);
    watch('./src/**/*.scss').on('change', server.reload);
}

const serve = series(parallel(styles, series(scripts)), startAppServer);
exports.icon = icon;
exports.styles = styles;
exports.pug = pug;
exports.scripts = scripts;
exports.lint = lint;
exports.serve = serve;



exports.copyFiles = copyFiles;
