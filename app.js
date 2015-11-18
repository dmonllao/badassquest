requirejs.config({
    baseUrl: 'app',
    paths: {
        bs: '../bower_components/bootstrap/dist/js/bootstrap',
        fontawesome: '../vendor/fontawesome-markers/fontawesome-markers.min',
        jquery: '../bower_components/jquery/dist/jquery',
        Phaser: '../bower_components/phaser/build/phaser'
    },
    shim: {
        bs: {
            deps: ['jquery'],
            exports: "$"
        },
        fontawesome: {
            exports: "fontawesome"
        }
    }
});

requirejs(['main']);
