define(['bs', 'Const', 'Generator', 'Router', 'Controls', 'Notifier', 'InfoWindow', 'PissedOffPeople', 'Icon'], function($, Const, Generator, Router, Controls, Notifier, InfoWindow, PissedOffPeople, Icon) {

    function User(map, playerName, playerPhoto) {

        this.map = map;
        this.playerName = playerName;
        this.photo = playerPhoto;

        this.state = {
            cHealth: 80,
            cFood: 2000,
            cWealth: 20,
            experience: 10,
            level: 1
        };

        this.attrs = {
            tHealth: Const.initHealth,
            tFood: Const.initFood,
            speed: Const.initSpeed,
            attack: Const.initAttack,
            defense: Const.initDefense
        };

        this.router = new Router(this.map);

        // Custom controls.
        this.controls = new Controls(this.map);
        this.controls.init(this);

        // Notifications service.
        this.notifier = new Notifier(this.map, this.controls);

        // People you piss off while playing.
        this.pissedOff = new PissedOffPeople(this.map, this);

        // TODO A pause feature should stop this timer.
        this.timers.dropFood = setInterval(this.breathDropFood.bind(this), Const.breathDropInterval);

        // TODO A pause feature should stop this timer.
        this.timers.revenues = setInterval(this.collectRevenues.bind(this), Const.revenuesInterval);

        // TODO A pause feature should stop this timer.
        this.timers.taxes = setInterval(this.collectTaxes.bind(this), Const.taxesInterval);
    }

    User.prototype = {

        // @type {string}
        playerName: null,

        // @type {string}
        photo: null,

        // @type {object}
        state: {},

        // @type {object}
        attrs: {},

        // @type {google.maps.Map}
        map: null,

        // @type {google.maps.Marker}
        marker: null,

        // @type {Router}
        router: null,

        // @type {Notifier}
        notifier: null,

        // @type {PissedOffPeople}
        pissedOff: null,

        properties: {},
        taxes: {},

        timers: {},

        setInitialPosition: function(position) {

            if (!position) {
                console.error('The selected story is not defining a initialPosition');
                return;
            }

            // Add the user marker to the specified position.
            this.marker = new google.maps.Marker({
                position: position,
                map: this.map,
                icon: {
                    url: this.photo,
                    scaledSize: new google.maps.Size(40, 40),
                },
                title: 'I\'m ' + this.playerName,
                zIndex: 9
            });
            google.maps.event.addListener(this.marker, 'click', function() {

                InfoWindow.openInfoInstance({
                    map: this.map,
                    marker: this.marker,
                    content: 'Hey! Click on the map, don\'t bug me!',
                    delay: 5000
                });
            }.bind(this));
        },

        breathDropFood: function() {
            this.updateState({
                cFood: this.state.cFood - Const.breathDropAmount
            });
        },

        passingBy: function() {

            // This runs for each step on the map, so every 50 milisecs.
            this.updateState({
                cFood: this.state.cFood - 1
            });

            // People shouts at you where you annoyed them.
            this.pissedOff.shout();
        },

        attackTurn: function(game, callback) {
            setTimeout(function() {
                callback();
            }.bind(this), Const.userAttackTime);
        },

        damageFoe: function(foe) {

            // Randomize the received damage a bit (+-2).
            var damagePoints = Generator.randomInteger(this.attrs.attack, 2);

            foe.state.cHealth = foe.state.cHealth - damagePoints;

            // Return the inflicted damage.
            return damagePoints;
        },

        moveTo: function(position, destinationCallback) {

            var destinationReachedCallback = function(reachedPosition) {

                // Execute the provided callback.
                if (typeof destinationCallback !== "undefined") {
                    destinationCallback(reachedPosition);
                }

                // We trigger the event, PoisManager will decide if nearby points should be fetched or not.
                $('#map').trigger('pois:get');
            }
            this.router.route(this.marker, position, this.passingBy.bind(this), destinationReachedCallback, this.attrs.speed);
        },

        addExperience: function(points) {

            if (points <= 0) {
                return;
            }

            this.state.experience = this.state.experience + points;

            // Fibonacci level up using 50 as Const.firstLevelUpExp.
            // 0 50 50 100 150 250 400 650 1050 1700...
            var prev = 0;
            var next = Const.firstLevelUpExp;
            var tmp;
            for (var i = 1; i < this.state.level; i++) {
                tmp = next;
                next = tmp + prev;
                prev = next;
            }
            var nextLevelUp = prev + next;

            var leveledUp = false;
            if (this.state.experience >= nextLevelUp) {
                console.log('Level up at ' + this.state.experience + ' experience');
                leveledUp = true;

                // Bump level, just one at a time, if someone gets enough experience
                // to jump 2 levels they still have to pass through addExperience twice.
                var prevAttack = this.attrs.attack;
                var prevDefense = this.attrs.defense;
                var prevSpeed = this.attrs.speed;

                this.levelUp(this.state.level + 1);

                // Update the controls.
                this.controls.update(this.state, this.attrs);
            }

            // Popover depends on whether the user leveled up or not.
            var popoverContent = null;
            if (leveledUp === true) {
                popoverContent = '<h4>Level up!</h4>';

                var extras = [];
                // Using ceil as in app/Controls.
                if (Math.ceil(prevAttack) !== Math.ceil(this.attrs.attack)) {
                    extras.push('Attack +' + (Math.ceil(this.attrs.attack) - Math.ceil(prevAttack)));
                }
                if (Math.ceil(prevDefense) !== Math.ceil(this.attrs.defense)) {
                    extras.push('Defense +' + (Math.ceil(this.attrs.defense) - Math.ceil(prevDefense)));
                }
                if (Math.ceil(prevSpeed) !== Math.ceil(this.attrs.speed)) {
                    extras.push('Speed +' + (Math.ceil(this.attrs.speed) - Math.ceil(prevSpeed)));
                }
                if (extras.length > 0) {
                    for (var i in extras) {
                        popoverContent += '<div class="levelup-attr">' + extras[i] + '</div>';
                    }
                }
            } else {
                popoverContent = "+ " + points + " experience points"
            }
            $('#level').popover({
                content: popoverContent,
                html: true,
                delay: {show: 1500, hide: 1000},
                placement: 'bottom',
                trigger: 'manual'
            });
            $('#level').popover('show');
            setTimeout(function() {
                $('#level').popover('destroy');
            }, 4000);
        },

        levelUp: function(level) {

            this.state.level = level;

            // Update user attrs. Here we multiply and allow floats,
            // but should be rounded when showing it.
            this.attrs.tHealth = this.attrs.tHealth * Const.levelUpAttrsIncrement;
            this.attrs.tFood = this.attrs.tFood * Const.levelUpAttrsIncrement;
            this.attrs.attack = this.attrs.attack * Const.levelUpAttrsIncrement;
            this.attrs.defense = this.attrs.defense * Const.levelUpAttrsIncrement;
            this.attrs.speed = this.attrs.speed * Const.levelUpAttrsIncrement;

            $('#map').trigger('user:levelup', [level]);
        },

        addProperty: function(property) {
            property.marker.setIcon(Icon.getByType('bought', 0.5));
            this.properties[property.poiData.place_id] = property;
        },

        getProperties: function() {
            return this.properties;
        },

        collectRevenues: function() {
            var total = 0;
            for (var i in this.properties) {
                if (this.properties.hasOwnProperty(i)) {
                    total += this.properties[i].revenue;
                }
            }

            if (total > 0) {
                this.updateState({
                    cWealth: this.state.cWealth + total
                });
            }
        },

        addExtortion: function(extortion) {
            // Actionbase.markAsDone already updated the marker icon.
            this.taxes[extortion.poiData.place_id] = extortion;
        },

        collectTaxes: function() {
            var total = 0;
            for (var i in this.taxes) {
                if (this.taxes.hasOwnProperty(i)) {
                    total += this.taxes[i].amount;
                }
            }

            if (total > 0) {
                this.updateState({
                    cWealth: this.state.cWealth + total
                });
            }
        },

        canIntimidate: function(poiData) {
            // TODO Should consider user level and attrs ideally, that
            // is why this is in User.
            for (var i in poiData.types) {
                var type = poiData.types[i];

                // Banks can't be intimidated.
                if (type === "bank" || type === 'atm') {
                    return false;
                }

                // Not likely that doctors or hospitals get intimidated.
                if (type === 'doctor' || type === "hospital") {
                    return (Math.random() > 0.8);
                }

                if (type === 'shopping_mall') {
                    return (Math.random() > 0.5);
                }
            }

            // TODO Other types depend on the number of reviews or something like that.
            return (Math.random() > 0.4);
        },

        updateState: function(params) {
            // This updates the current values.

            // Limited to tFood.
            if (typeof params.cFood !== "undefined") {
                this.state.cFood = params.cFood;
                if (this.state.cFood > this.attrs.tFood) {
                    this.state.cFood = this.attrs.tFood;
                    // TODO popover if life starts draining.
                }
            }

            // Limited to tHealth.
            if (typeof params.cHealth !== "undefined") {
                this.state.cHealth = params.cHealth;
                if (this.state.cHealth > this.attrs.tHealth) {
                    this.state.cHealth = this.attrs.tHealth;
                }
            }

            // Food and health zero limits.
            if (this.state.cFood < 0) {
                this.state.cFood = 0;
                this.state.cHealth--;
            }
            if (this.state.cHealth <= 0) {
                this.state.cHealth = 0;
                this.dead();
            }

            // Limited to 0.
            // TODO Prevent buying stuff if 0 money.
            if (typeof params.cWealth !== "undefined") {
                this.state.cWealth = params.cWealth;
                if (this.state.cWealth < 0) {
                    this.state.cWealth = 0;
                }
            }

            this.controls.update(this.state, this.attrs);
        },

        isDead: function() {
            if (this.state.cHealth <= 0) {
                return true;
            }
            return false;
        },

        dead: function() {
            this.router.clearRoute();

            for (var i in this.timers) {
                if (this.timers.hasOwnProperty(i)) {
                    clearInterval(this.timers[i]);
                }
            }

            $('#status-title').html('Game over');
            $('#status-content').html('You died! Try again loser.');
            $('#status').modal('show');

            $('text-action').modal('hide');
            $('game-action').modal('hide');
        }

    };

    return User;
});
