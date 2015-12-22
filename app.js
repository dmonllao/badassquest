requirejs.config({
    baseUrl: 'app',
    paths: {
        fontawesome: '../vendor/fontawesome-markers/fontawesome-markers.min',
        jquery: '../bower_components/jquery/dist/jquery',
        jqueryShake: '../vendor/others/jquery-shake',
        bs: '../bower_components/bootstrap/dist/js/bootstrap',
        Phaser: '../bower_components/phaser/build/phaser',
        async: '../bower_components/requirejs-plugins/src/async',
        epoly: '../vendor/blackpoolchurch/v3_epoly',
        infobox: '../vendor/google/infobox',
    },
    shim: {
        jqueryShake: {
            deps: ['jquery'],
            exports: "$"
        },
        bs: {
            deps: ['jquery', 'jqueryShake'],
            exports: "$"
        },
        fontawesome: {
            exports: "fontawesome"
        },
        infobox: {
            deps: ['google']
        },
        epoly: {
            deps: ['google']
        }
    }
});

requirejs(['main']);
