define(['bs', 'Const', 'Util', 'InfoWindow'], function($, Const, Util, InfoWindow) {

    var pissedOffSentences = [
        'Look what you have done! You will burn in hell',
        'Hey hey look at him! You should be ashamed!',
        'I will tell your mother you like to destroy people\'s lives',
        'He who laughs last laughs best, we will see you dead!'
    ];

    function PissedOffPeople(map, user) {
        this.map = map;
        this.user = user;
        return this;
    }

    PissedOffPeople.prototype = {
        map: null,
        user: null,
        places: [],

        add: function(pissedOff) {
            // + something to avoid shouting immediatelly.
            pissedOff.time = Math.floor(Date.now() / 1000) + Const.passingByRampUp;
            this.places.push(pissedOff);
        },

        shout: function() {
            for (var i in this.places) {

                var pissedOff = this.places[i];
                if (this.pissedOffComplains(pissedOff)) {

                    // Tag it as shouting to prevent duplicates.
                    pissedOff.shouting = true;

                    InfoWindow.openInfoInstance({
                        map: this.map,
                        marker: pissedOff.marker,
                        content: Util.getRandomElement(pissedOffSentences),
                        closedCallback: function() {
                            // Reset it to shout again in a while.
                            pissedOff.shouting = false;
                            pissedOff.time = Math.floor(Date.now() / 1000) + Const.passingByLapse;
                        }.bind(this)
                    });
                }
            }
        },

        /**
         * This should be as quick as possible.
         */
        pissedOffComplains: function(pissedOff) {

            var currentPos = this.user.marker.getPosition();

            // We check that they are not already complaining.
            if (!pissedOff.shouting && pissedOff.time < (Math.floor(Date.now() / 1000)) &&
                    currentPos.distanceFrom(pissedOff.marker.getPosition()) <= Const.closePositionPissed) {
                return true;
            }

            return false;
        },

    };

    return PissedOffPeople;
});
