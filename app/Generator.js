define(['Const'], function(Const) {

    return {

        randomInteger: function(value, variation) {
            // Rest the variation.
            value = value - variation;

            // random * variation * 2
            // We end up with a random value from value - variation to value + variation.
            return Math.round(value + Math.random() * variation * 2);
        },

        poiPrice: function(poiData) {
            //TODO Testing
            return 20;
            // Some base.
            var price = 1000;

            // More weight to the fact that the poi got a review than to the rating itself.
            if (poiData.reviews) {

                // poiData.reviews has a max of 5.
                if (poiData.user_ratings_total) {
                    price += poiData.user_ratings_total * 100;
                } else {
                    price += poiData.reviews.length * 100;
                }

                // poidata.rating is not always available.
                if (poiData.rating) {
                    price = price * poiData.rating;
                } else {
                    var rating = 0;
                    for (var i in poiData.reviews) {
                        rating += poiData.reviews[i].rating;
                    }
                    // Average rating.
                    rating = Math.round(rating / poiData.reviews.length);
                    price = price * rating;
                }
            }

            // Goes from 0 to 4
            if (poiData.price_level) {
                price = price * (poiData.price_level + 1);
            }

            if (poiData.website) {
                price *= 1.3;
            }

            return Math.round(price);
        },

        /**
         * @param {Object} poiData
         * @param {?poiPrice} poiPrice Speeds up the process.
         */
        poiRevenues: function(poiData, poiPrice) {

            if (typeof poiPrice === "undefined") {
                poiPrice = this.poiPrice(poiData);
            }

            // Should be redeemed after 20 mins.
            // poiPrice ---------- 20 seconds
            //    x     ---------- Const.revenuesInterval.
            //
            // TODO This could be improved basing it on the user level and guessing how much
            // time they could need to gather poiPrice.
            var revenues = Const.revenuesInterval * poiPrice / (20 * 60 * 1000);

            // Goes from 0 to 4
            if (poiData.price_level) {
                // Not +1 as level 0 means 'free'.
                revenues = revenues * poiData.price_level;
            }

            return Math.round(revenues);
        },

        /**
         * Returns partly randomized data for a chase based on importance.
         *
         * @param {!Number} From 1 to 10
         */
        chaseData: function(importance, name, position) {

            // Random speed, duration and reRouteLimit, but all based on importance.
            return {
                start: position,
                name: name,
                speed: this.getRandomSpeed(importance),
                duration: this.getRandomDuration(importance),
                reRouteLimit: this.getRandomReRouteLimit(importance)
            };
        },

        foe: function(importance, name) {

            return {
                name: name,
                tHealth: this.getRandomHealth(importance),
                attack: this.getRandomAttack(importance),
                defense: this.getRandomDefense(importance),
                speed: this.getRandomSpeed(importance),
            }
        },

        getRandomHealth: function(importance) {

            // Get the max health a user can get. Levels should be infinite, so
            // we only have a reasonable max level.
            var maxHealth = Math.floor(Const.initHealth * Math.pow(Const.levelUpAttrsIncrement, Const.maxReasonableLevel));

            // How much is a unit.
            var unit = maxHealth / 10;

            // How much speed would be equivalent to get.
            var health = importance * unit;

            // Now randomize a bit from health - 4 to health +4.
            return this.randomInteger(health, 4);
        },

        getRandomAttack: function(importance) {

            // Get the max attack a user can get. Levels should be infinite, so
            // we only have a reasonable max level.
            var maxAttack = Math.floor(Const.initAttack * Math.pow(Const.levelUpAttrsIncrement, Const.maxReasonableLevel));

            // How much is a unit.
            var unit = maxAttack / 10;

            // How much speed would be equivalent to get.
            var attack = importance * unit;

            // Now randomize a bit from attack - 4 to attack +4.
            return this.randomInteger(attack, 4);
        },

        getRandomDefense: function(importance) {

            // Get the max defense a user can get. Levels should be infinite, so
            // we only have a reasonable max level.
            var maxDefense = Math.floor(Const.initDefense * Math.pow(Const.levelUpAttrsIncrement, Const.maxReasonableLevel));

            // How much is a unit.
            var unit = maxDefense / 10;

            // How much speed would be equivalent to get.
            var defense = importance * unit;

            // Now randomize a bit from defense - 4 to defense +4.
            return this.randomInteger(defense, 4);
        },

        getRandomSpeed: function(importance) {

            // Get the max speed a user can get. Levels should be infinite, so
            // we only have a reasonable max level.
            var maxSpeed = Math.floor(Const.initSpeed * Math.pow(Const.levelUpAttrsIncrement, Const.maxReasonableLevel));

            // How much is a unit.
            var unit = maxSpeed / 10;

            // How much speed would be equivalent to get.
            var speed = importance * unit;

            // Now randomize a bit from speed - 1 to speed + 1 but adding an extra
            // + 2 because rerouting is depending on the network and it takes time.
            return this.randomInteger(speed, 1) + 2
        },

        getRandomDuration: function(importance) {

            var unit = Const.maxChaseDuration / 10;
            var duration = importance * unit;

            // Randomize from -2 to +2 + some extra secs.
            var randomized = this.randomInteger(duration, 2) + 4;

            // Minimum 8 seconds + the advantage we give to the user.
            return Math.max(8, randomized) + Const.chaseStartDelay;
        },

        getRandomReRouteLimit: function(importance) {

            var unit = Const.maxReRouteLimit / 10;
            var reRoute = importance * unit;

            // Randomize from -1 to +1
            var randomized = this.randomInteger(reRoute, 1);

            // Minimum 3 reroutes.
            return Math.max(3, randomized);
        }
    };
});
