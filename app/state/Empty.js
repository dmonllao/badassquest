define(['Phaser'], function(Phaser) {

    var game = null;

    function Empty(appGame) {
        game = appGame;
    }

    Empty.prototype = {

        preload: function() {
        },
        create: function() {
        }
    }

    return Empty;
});
