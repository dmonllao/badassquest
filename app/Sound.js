define(['bs'], function($) {

    var mute = false;

    var soundCloudPlayer = null;

    function Sound() {
        return this;
    }

    Sound = {

        init: function() {

            // Event subscriptions.
            $('#map').on('user:levelup', function(ev, newLevel) {
                Sound.play('achievement');
            });

            // Dependant on soundcloud availability. We don't want the whole game
            // to break if SC is not available.
            require(['no-sound-during-dev'], function() {
                if (typeof SC !== 'undefined') {
                    SC.initialize({
                      client_id: ''
                    });

                    SC.stream('/tracks/253089256').then(function(player){
                        soundCloudPlayer = player;
                        soundCloudPlayer.play();
                        soundCloudPlayer.on('finish', function() {
                            soundCloudPlayer.seek(0);
                            soundCloudPlayer.play();
                        }.bind(this));
                    });
                }
            }, function(err) {
                console.log('Not able to load soundcloud music');
            });
        },

        toggle: function() {

            if (mute === true) {
                mute = false;
                if (soundCloudPlayer) {
                    soundCloudPlayer.play();
                }
            } else {
                mute = true;
                if (soundCloudPlayer) {
                    soundCloudPlayer.pause();
                }
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
