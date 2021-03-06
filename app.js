requirejs.config({
    baseUrl: 'app',
    paths: {
        fontawesomeMarkers: '../bower_components/fontawesome-markers/fontawesome-markers.min',
        jquery: '../bower_components/jquery/dist/jquery',
        bs: '../bower_components/bootstrap/dist/js/bootstrap',
        Phaser: '../bower_components/phaser/build/phaser',
    },
    shim: {
        bs: {
            deps: ['jquery'],
            exports: "$"
        },
    }
});

requirejs(['main']);
