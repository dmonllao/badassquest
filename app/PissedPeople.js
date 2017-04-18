define(['bs', 'Const', 'Generator', 'InfoWindow'], function($, Const, Generator, InfoWindow) {

    function PissedPeople(map, user) {
        this.map = map;
        this.user = user;
        return this;
    }

    PissedPeople.prototype = {
        map: null,
        user: null,
        places: [],

        add: function(pissed) {
            // + something to avoid shouting immediatelly.
            pissed.time = Math.floor(Date.now() / 1000) + Const.passingByRampUp;
            this.places.push(pissed);
        },

        shout: function() {
            for (var i in this.places) {

                var pissed = this.places[i];
                if (this.pissedComplains(pissed)) {

                    // Tag it as shouting to prevent duplicates.
                    pissed.shouting = true;

                    InfoWindow.openInfoInstance({
                        map: this.map,
                        marker: pissed.marker,
                        content: Generator.getRandomBadMoodLine(),
                        closedCallback: function() {
                            // Reset it to shout again in a while.
                            pissed.shouting = false;
                            pissed.time = Math.floor(Date.now() / 1000) + Const.passingByLapse;
                        }.bind(this)
                    });
                }
            }
        },

        /**
         * This should be as quick as possible.
         */
        pissedComplains: function(pissed) {

            var currentPos = this.user.marker.getPosition();

            // We check that they are not already complaining.
            if (!pissed.shouting && pissed.time < (Math.floor(Date.now() / 1000)) &&
                    currentPos.distanceFrom(pissed.marker.getPosition()) <= Const.closePositionPissed) {
                return true;
            }

            return false;
        },

    };

    return PissedPeople;
});
