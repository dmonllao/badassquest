({
    baseUrl: 'app',
    paths: {
        fontawesomeMarkers: '../bower_components/fontawesome-markers/fontawesome-markers.min',
        jquery: '../bower_components/jquery/dist/jquery',
        bs: '../bower_components/bootstrap/dist/js/bootstrap',
        Phaser: '../bower_components/phaser/build/phaser',
    },
    include: ['Const', 'Map', 'UI', 'User', 'Game', 'StoryManager', 'ChaseTracker', 'PoisManager', 'PoliticsManager', 'InfoWindow', '../app'],
    mainConfigFile: 'app.js',
    name: 'main',
    out: 'built.js'
})
