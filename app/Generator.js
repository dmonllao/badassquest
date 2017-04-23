define(['Const'], function(Const) {

    var names = [
        'Zada Zhu', 'Shonda Sponaugle', 'Leon Limbaugh', 'Lemuel Loso', 'Ernest Elliff', 'Madaline Montagna', 'Cayla Crusoe',
        'Mireya Maria', 'Adena Alverson', 'Dong Driver', 'Jefferey Jen', 'Al Ammon', 'Sharen Schwandt', 'Clelia Clagon',
        'Pok Piersall', 'Nadia Newcombe', 'Verena Valenzuela', 'Paige Parchman', 'Lonna Lyall', 'Refugio Racine', 'Brenton Bednarz',
        'Shantay Schaal', 'Ashanti Antunez', 'Louie Lally', 'Brittny Brinks', 'Erminia Eyman', 'Hollie Herlihy', 'Demetrius Dearth',
        'Vanna Vanfossen', 'Galina Grindstaff', 'Irena Isler', 'Phylicia Paulin', 'Katy Krauss', 'Carman Cassinelli', 'Lessie Lamy',
        'Tama Tinney', 'Elke Entrekin', 'Casandra Cruzado', 'Chris Cantrell', 'Bettye Bradish', 'Else Endicott', 'Haley Henshaw',
        'Jerome Jumper', 'Tonette Troop', 'Tandra Toohey', 'Alica Armstead', 'Aide Angert', 'Myong Monte', 'Nakisha Negron',
        'Vivian Vernon'
    ];

    /**
     * For people that badass already annoyed.
     *
     * Keep them short, should fit in 1 line even in mobile window size.
     */
    var badMoodLines = [
        'Look what you have done! You will burn in hell',
        'Hey hey look at him! You should be ashamed!',
        'I will tell your mother you like to destroy people\'s lives',
        'He who laughs last laughs best, we will see you dead!',
    ];

    /**
     * For random people that walks streets.
     *
     * Keep them short, should fit in 1 line even in mobile window size.
     */
    var pedestrianLines = [
        'you badass',
        'look at that stallion',
        'hey you macho man',
        'run Johnny boy run, that guy looks dangerous',
        'don\'t stare at him Sheila, you eyes will burn if you do',
        'such a stallion',
        'penetrator',
        'what an alpha male',
        'uuuuhh papi where are you going',
        'such a papi chulo',
        'oh! he looked at me. I just got pregnant.',
        'mmmmm, pure horse power',
        'uffff, my undercarriage is steaming',
        'heavy weapon at 10pm Sheila',
        'children! escape while you can!!',
        'make me a baby papi',
        'badass style === tiny Willy',
        'where are your sunglasses terminator',
        'arrrggg he looked at me! pressure in my heart! I\'m dying...',
        'I\'ve just peed myself',
        'he saw me, I\'m frozen, I can\'t move',
        'uhhh papitooo, big size menu for me please',
        'that\'s a tool, best plumber ever',
        'time to move to another neighbourhood',
        'ruuuunnnn',
        'hey hey hey hey',
        'I want to disappeeeaaaarree',
        'sorry for existing, don\'t kill me, Orz',
        '(heart attack)',
        'take my wallet',
        'don\'t hurt me please I am not worth',
        'please don\'t punch my baby',
        'father of hordes',
        'what is that smell?',
    ];

    var usedPersonImages = [];

    /**
     * Mission titles should be unique! We are using array map to retrieve an index from the mission title.
     */
    var missions = {
        ActionSteal: [
            {
                title: 'Pink underwear',
                infoMessage: 'I need underwear for...a friend! Go and steal it for me, I will pay you.',
                doneMessage: 'So naughty... this is exactly what I wanted.',
            }, {
                title: 'Monkey crane',
                infoMessage: 'I saw in the news that they got a monkey crane, I want it for my private collection!',
                doneMessage: 'hehehe, thanks. There it is, your reward.'
            }
        ],
        ActionFight: [
            {
                title: 'Burn cockburn burn',
                infoMessage: 'Mr Cockburn owes me a lot of money and they don\'t want to pay, I want them dead.',
                doneMessage: 'Another one bites the dust. You are a badass mate, thanks.',
            }, {
                title: 'Defense',
                infoMessage: 'I\'ve heard that Joselito the owner wants to kill me, I need you to kill him before me.',
                doneMessage: 'Yeah, that was close...'
            }
        ],
        ActionExtort: [
            {
                title: 'Just extortion',
                infoMessage: 'Check out this place, I need you to get my money back.',
                doneMessage: 'Well done mate, take some money for you. You will get more money next time.',
            }, {
                title: 'Protection',
                infoMessage: 'I offered them protection and they refused, I think that we should be more persuasive, do you understand me?...',
                doneMessage: 'This is what I meant :)'
            }
        ],
        ActionBuy: [
            {
                title: 'Just a house',
                infoMessage: 'I need you to buy this place, but Police is after me, register it at your name.',
                doneMessage: 'That was good, I will see you there.',
            }, {
                title: 'Expanding the area',
                infoMessage: 'I want to expand my influence in this area, go and buy this for me.',
                doneMessage: 'Good good good, see you around.'
            }
        ],
        ActionHack: [
            {
                title: 'ATM Hacking',
                infoMessage: 'I need you to hack an ATM',
                doneMessage: 'Thanks mate'
            }
        ]
    };

    return {

        randomInteger: function(value, variation) {
            // Rest the variation.
            value = value - variation;

            // random * variation * 2
            // We end up with a random value from value - variation to value + variation.
            return Math.round(value + Math.random() * variation * 2);
        },

        getRandomIndex: function(max) {
            return Math.floor(Math.random() * max);
        },

        getRandomElement: function(elements) {
            var randomIndex = this.getRandomIndex(elements.length);
            return elements[randomIndex];
        },

        /**
         * This returns a promise in case we want to use an external service in future.
         *
         * @return Promise
         */
        getRandomPersonImage: function() {

            var imageIndex = this.getRandomIndex(Const.picsNum);

            // Shortcut in case we already ran out of random pics.
            if (usedPersonImages.length == Const.picsNum) {
                var promise = new $.Deferred();
                promise.resolve('img/people/' + imageIndex + '.jpg');
                return promise;
            }

            while (usedPersonImages.indexOf(imageIndex) !== -1) {
                imageIndex = this.getRandomIndex(Const.picsNum);
            }

            // Add the pic to used pics list.
            usedPersonImages.push(imageIndex);

            // Yeah, I know it looks dumb read ^ (method doc).
            var promise = new $.Deferred();
            promise.resolve('img/people/' + imageIndex + '.jpg');
            return promise;
        },

        getRandomName: function() {
            return this.getRandomElement(names);
        },

        getRandomBadMoodLine: function() {
            return this.getRandomElement(badMoodLines);
        },

        getRandomPedestrianLine: function() {
            return this.getRandomElement(pedestrianLines);
        },

        poiPrice: function(poiData) {

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
            // poiPrice ---------- 20 mins
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

        poiExtortionTax: function(poiData, poiPrice) {

            if (typeof poiPrice === "undefined") {
                poiPrice = this.poiPrice(poiData);
            }

            var tax = poiPrice / 10000;

            // Limit it a bit 3 < x < 100.
            tax = Math.min(Math.max(tax, 100), 5);

            return Math.round(tax);
        },

        /**
         * Returns partly randomized data for a chase based on importance.
         *
         * @param {!Number} From 1 to 10
         */
        chaseData: function(importance, user, name, position) {

            // Random speed, duration and reRouteLimit, but all based on importance.
            return {
                start: position,
                name: name,
                speed: this.getRandomFoeSpeed(importance, user),
                duration: this.getRandomFoeDuration(importance),
                reRouteLimit: this.getRandomFoeReRouteLimit(importance)
            };
        },

        /**
         * Generates an N number of foes based on the poi data.
         */
        foes: function(poiData, user) {

            // By default things are not that important.
            var importance = 3;

            // 1 by default.
            var foesN = 1;

            for (var i in poiData.types) {
                var type = poiData.types[i];

                // Banks can't be intimidated.
                if (type === "bank" || type === 'atm') {
                    foesN = this.randomInteger(3, 1);
                    importance = 10;
                }

                // Not likely that doctors or hospitals get intimidated.
                if (type === 'doctor' || type === "hospital") {
                    foesN = 1;
                    importance = 4;
                }

                if (type === 'shopping_mall') {
                    foesN = this.randomInteger(3, 1);
                    importance = 6;
                }
            }

            // Generate foes.
            var foes = [];
            for (var i = 0; i < foesN; i++) {
                foes[i] = this.foe(importance, user);
            };
            return foes;
        },

        foe: function(importance, user) {

            return {
                name: this.getRandomName(),
                tHealth: this.getRandomFoeHealth(importance, user),
                speed: this.getRandomFoeSpeed(importance, user),
                attack: this.getRandomFoeAttack(importance, user),
                defense: this.getRandomFoeDefense(importance, user),
                duration: this.getRandomFoeDuration(importance),
                reRouteLimit: this.getRandomFoeReRouteLimit(importance),
            }
        },

        foeDamage: function(attack, user) {

            // Limited to attack / 2.
            var variation = Math.round(user.attrs.tHealth / 20);
            variation = Math.min(variation, Math.round(attack / 2));

            return this.randomInteger(attack, variation);
        },

        getRandomFoeHealth: function(importance, user) {

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

        getRandomFoeAttack: function(importance, user) {

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

        getRandomFoeDefense: function(importance, user) {

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

        getRandomFoeSpeed: function(importance, user) {

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

        getRandomFoeDuration: function(importance) {

            var unit = Const.maxChaseDuration / 10;
            var duration = importance * unit;

            // Randomize from -2 to +2 + some extra secs.
            var randomized = this.randomInteger(duration, 2) + 4;

            // Minimum 8 seconds + the advantage we give to the user.
            return Math.max(8, randomized) + Const.chaseStartDelay;
        },

        getRandomFoeReRouteLimit: function(importance) {

            var unit = Const.maxReRouteLimit / 10;
            var reRoute = importance * unit;

            // Randomize from -1 to +1
            var randomized = this.randomInteger(reRoute, 1);

            // Minimum 3 reroutes.
            return Math.max(3, randomized);
        },

        getRandomMission: function(user, actionType) {
            if (typeof missions[actionType.name] === "undefined") {
                console.error('No missions available for ' + actionType.name + ' action');
                return null;
            }

            if (missions[actionType.name].length === 0) {
                return null;
            }

            var actionMissions = missions[actionType.name];
            var mission = this.getRandomElement(actionMissions);

            // Remove the mission from the list of available missions.
            var index = actionMissions.map(function(e) { return e.title; }).indexOf(mission.title);
            actionMissions.splice(index, 1);

            return mission;
        },

        getRandomReward: function(user) {
            // TODO Too lazy to think about this now :P
            return user.state.level * 10;
        }
    };
});
