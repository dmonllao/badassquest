define(['bs'], function($) {

    var mute = false;

    var musicNode = null;

    var musicInterval = null;

    function Sound() {
        return this;
    }

    Sound = {

        init: function() {

            // Event subscriptions.
            $('#map').on('user:levelup', function(ev, newLevel) {
                Sound.play('achievement');
            });

            musicNode = $('#soundcloud');

            Sound.addInterval();
        },

        addInterval: function() {
            musicInterval = setInterval(function() {
                musicNode.remove();
                $('#body').append(musicNode);
            }, 110000);
        },

        toggle: function() {

            if (mute === true) {
                mute = false;
                $('#body').append(musicNode);
                Sound.addInterval();
            } else {
                mute = true;
                musicNode.remove();
                clearInterval(musicInterval);
            }

            // Returns sound yes or no.
            return !mute;
        },

        play: function(sound) {

            if (mute) {
                return;
            }

            var file = null;
            switch (sound) {
                case 'achievement':
                    file = 'sound/achievement.mp3';
                    break;
                case 'heal':
                    file = 'sound/heal.mp3';
                    break;
                case 'hit':
                    file = 'sound/hit.mp3';
                    break;
                case 'kill':
                    file = 'sound/kill.mp3';
                    break;
                case 'hurt':
                    file = 'sound/hurt.mp3';
                    break;
                default:
                    console.warn('Invalid sound ' + sound + ' provided');
                    return;
            }
            var audioplayer = new Audio(file);
            audioplayer.play();
        }

    };

    return Sound;
});
