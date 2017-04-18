define(['bs'], function($) {

    var mute = false;

    function Sound() {
        return this;
    }

    Sound.prototype = {

        init: function() {

            // Event subscriptions.
            $('#map').on('user:levelup', function(ev, newLevel) {
                this.play('sound/cash.mp3');
            });
        },

        toggle: function() {

            if (mute === true) {
                mute = false;
            } else {
                mute = true;
            }
        },

        play: function(file) {
            if (!mute) {
                var audioplayer = new Audio(file);
                audioplayer.play();
            }
        },
    };

    return Sound;
});
