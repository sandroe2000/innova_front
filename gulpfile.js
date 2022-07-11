/*
# Uninstall previous Gulp installation and related packages, if any
$ npm rm gulp -g
$ npm rm gulp-cli -g
$ cd [your-project-dir/]
$ npm rm gulp --save-dev
$ npm rm gulp --save
$ npm rm gulp --save-optional
$ npm cache clean # for npm < v5

# Install the latest Gulp CLI tools globally
$ npm install --global gulp-cli

# Install Gulp 4 into your project as dev dependency
$ npm install gulp --save-dev

npm install

# Check the versions installed. Make sure your versions are not lower than shown.
$ gulp -v
*/
(() => {

    'use strict';

    const gulp = require('gulp');
    const browsersync = require('browser-sync').create();
    const { createProxyMiddleware } = require(' ');

    const files = [
        './app/*.html',
        './app/*/*.html',
        './app/*/*/*.html',
        './app/*.js',
        './app/*/*.js',
        './app/*/*/*.js',
        './core/*.js',
        './assets/css/*css'
    ];

    const jsonPlaceholderProxy = createProxyMiddleware(['/api'], {
        target: 'http://localhost:8080',
        changeOrigin: true,
        logLevel: 'debug'
    });

    function watch() {
        browsersync.init({
            server: {
                baseDir: './',
                middleware: [jsonPlaceholderProxy]
            },
        });
    }

    gulp.watch(files).on('change', browsersync.reload);
    const dev = gulp.series(watch);

    exports.default = dev;

})();