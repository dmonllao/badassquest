define(['bs', 'Const', 'UI', 'Generator', 'Router', 'Controls', 'Notifier', 'InfoWindow', 'PissedPeople', 'ControlledAreas', 'Icon'], function($, Const, UI, Generator, Router, Controls, Notifier, InfoWindow, PissedPeople, ControlledAreas, Icon) {

    var healthWarningShown = false;
    var foodWarningShown = false;

    // We need vars for visibilityChange and hidden as there is
    // no standard for all browsers versions.
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        // Opera 12.10 and Firefox 18 and later support.
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    function User(map, playerName, playerPhoto) {

        this.map = map;
        this.playerName = playerName;

        this.photo = localStorage.getItem('userPhoto');
        if (!this.photo) {
            this.photo = playerPhoto;
        }

        this.state = localStorage.getItem('userState');
        if (this.state) {
            this.state = JSON.parse(this.state);
        } else {
            // New state.
            this.state = {
                cHealth: Const.initHealth,
                cFood: Const.initFood,
                cWealth: Const.initWealth,
                experience: 10,
                level: 1
            };
        }

        this.attrs = localStorage.getItem('userAttrs');
        if (this.attrs) {
            this.attrs = JSON.parse(this.attrs);
        } else {
            this.attrs = {
                tHealth: Const.initHealth,
                tFood: Const.initFood,
                speed: Const.initSpeed,
                attack: Const.initAttack,
                defense: Const.initDefense
            };
        }

        this.achievements = localStorage.getItem('userAchievements');
        if (this.achievements) {
            this.achievements = JSON.parse(this.achievements);
        } else {
            this.achievements = {};
        }
        this.refreshAchievementsList();

        this.ongoingMissions = localStorage.getItem('userOngoingMissions');
        if (this.ongoingMissions) {
            this.ongoingMissions = JSON.parse(this.ongoingMissions);
        } else {
            this.ongoingMissions = {};
        }

        this.router = new Router(this.map, true);

        // Custom controls.
        this.controls = new Controls();
        this.controls.init(this);

        // Notifications service.
        setTimeout(function() {
            this.notifier = new Notifier(this.map, this.controls);
        }.bind(this), 1000);

        // People you piss off while playing.
        this.pissed = new PissedPeople(this.map, this);

        // Manages the pois and areas the user controls.
        this.controlledAreas = new ControlledAreas(this.map);

        var properties = null;
        if (properties = localStorage.getItem('userProperties')) {
            properties = JSON.parse(properties)
            if (!$.isEmptyObject(properties)) {
                this.restoreElement(properties, 'properties', 'home', false);
            }
        }
        var taxes = null;
        if (taxes = localStorage.getItem('userTaxes')) {
            taxes = JSON.parse(taxes)
            if (!$.isEmptyObject(taxes)) {
                this.restoreElement(taxes, 'taxes', 'done', true);
            }
        }
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

        // @type {PissedPeople}
        pissed: null,

        // @type {ControlledAreas}
        controlledAreas: null,

        achievements: {},

        properties: {},

        taxes: {},

        timers: {},

        setPosition: function(position) {
            if (this.marker === null) {
                // This already sets the position.
                this.createMarker(position);
                return;
            }
            this.marker.setPosition(position);
        },

        gameStarted: function() {

            this.startIntervals();

            document.addEventListener(visibilityChange, function(ev) {
                if (document[hidden]) {
                    this.clearIntervals();
                } else {
                    this.startIntervals();
                }
            }.bind(this));
        },

        createMarker: function(position) {
            // Create the user marker on the specified position.
            this.marker = new google.maps.Marker({
                position: position,
                map: this.map,
                icon: {
                    url: this.photo,
                    scaledSize: new google.maps.Size(40, 40),
                },
                title: this.playerName,
                zIndex: 9,
                optimized: false,
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

        updatePhoto: function(src) {
            this.photo = src;
            this.marker.setIcon({
                url: this.photo,
                scaledSize: new google.maps.Size(40, 40),
            });
        },

        passingBy: function() {

            // This runs for each step on the map, so every 50 milisecs.
            this.updateState({
                cFood: this.state.cFood - 1
            });

            // People shouts at you where you annoyed them.
            this.pissed.shout();
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

            InfoWindow.closeAll();

            var destinationReachedCallback = function(reachedPosition) {

                // Execute the provided callback.
                if (typeof destinationCallback !== "undefined") {
                    destinationCallback(reachedPosition);
                }

                $('#map').trigger('move:finished');
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
            this.properties[property.poiData.place_id] = property;
        },

        addAchievement: function(achievement) {
            this.achievements[achievement.id] = achievement;
            this.refreshAchievementsList();
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

        /**
         * @return {Boolean} True if the player is alive, false if it is not.
         */
        updateState: function(params) {
            // This updates the current values.

            // Limited to tFood.
            if (typeof params.cFood !== "undefined") {
                this.state.cFood = params.cFood;
                if (this.state.cFood > this.attrs.tFood) {
                    this.state.cFood = this.attrs.tFood;
                }
                // popover if energy starts draining.
                if (foodWarningShown === false && this.state.cFood < 200) {
                    $('#food').popover({
                        placement: 'bottom',
                        delay: {show: 500, hide: 100},
                        html: true,
                        trigger: 'manual',
                        content: 'Go to the restaurant <i class="fa fa-cutlery" style="color: grey;"></i> and eat something or you will die!',

                    });
                    $('#food').popover('show');
                    setTimeout(function() {
                        $('#food').popover('destroy');
                    }, 5000);
                    foodWarningShown = true;
                }
            }

            // Limited to tHealth.
            if (typeof params.cHealth !== "undefined") {
                this.state.cHealth = params.cHealth;
                if (this.state.cHealth > this.attrs.tHealth) {
                    this.state.cHealth = this.attrs.tHealth;
                }

                // popover if life starts draining.
                if (healthWarningShown === false && this.state.cHealth < 40) {
                    $('#health').popover({
                        delay: {show: 500, hide: 100},
                        placement: 'bottom',
                        html: true,
                        trigger: 'manual',
                        content: 'You are seriously injured. Go to the hospital <i class="fa fa-h-square" style="color: #e15c5c;"></i>, ' +
                            'eat something <i class="fa fa-cutlery" style="color: grey;"></i> or you will die!',

                    });
                    $('#health').popover('show');
                    setTimeout(function() {
                        $('#health').popover('destroy');
                    }, 5000);
                    healthWarningShown = true;
                }

            }

            // Food and health zero limits.
            if (this.state.cFood < 0) {
                this.state.cFood = 0;
                this.state.cHealth--;
            }
            if (this.state.cHealth <= 0) {
                this.state.cHealth = 0;
                this.unconscious();
                return false;
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

            return true;
        },

        /**
         * Alias to keep isDead shared with Foe.
         */
        isUnconscious: function() {
            return this.isDead();
        },

        isDead: function() {
            if (this.state.cHealth <= 0) {
                return true;
            }
            return false;
        },

        startIntervals: function() {
            this.timers.refreshControls = setInterval(this.controls.setControls.bind(this.controls), Const.refreshControlsInterval);
            this.timers.dropFood = setInterval(this.breathDropFood.bind(this), Const.breathDropInterval);
            this.timers.revenues = setInterval(this.collectRevenues.bind(this), Const.revenuesInterval);
            this.timers.taxes = setInterval(this.collectTaxes.bind(this), Const.taxesInterval);
            this.timers.saveGame = setInterval(this.saveGame.bind(this), Const.saveInterval);
        },

        clearIntervals: function() {
            for (var i in this.timers) {
                if (this.timers.hasOwnProperty(i)) {
                    clearInterval(this.timers[i]);
                }
            }
        },

        saveGame: function() {
            localStorage.setItem('userPhoto', this.photo);
            localStorage.setItem('userState', JSON.stringify(this.state));
            localStorage.setItem('userAttrs', JSON.stringify(this.attrs));
            localStorage.setItem('userAchievements', JSON.stringify(this.achievements));
            localStorage.setItem('userOngoingMissions', JSON.stringify(this.ongoingMissions));
            localStorage.setItem('userPosition', JSON.stringify({
                lat: this.marker.getPosition().lat(),
                lng: this.marker.getPosition().lng()
            }));

            // We need to get rid of properties and taxes markers.
            this.saveElement('properties', 'userProperties');
            this.saveElement('taxes', 'userTaxes');

            $('#map').trigger('game:save');
        },

        saveElement: function(attributeName, itemName) {
            var stored = {};
            for (var i in this[attributeName]) {
                stored[i] = $.extend({}, this[attributeName][i]);
                var markerPosition = stored[i].marker.getPosition()
                stored[i].marker = {
                    lat: markerPosition.lat(),
                    lng: markerPosition.lng()
                };
            }
            localStorage.setItem(itemName, JSON.stringify(stored));
        },

        restoreElement: function(data, attributeName, iconType, pissed) {

            for (var i in data) {
                var position = new google.maps.LatLng(data[i].marker.lat, data[i].marker.lng);

                data[i].marker = new google.maps.Marker({
                    map: this.map,
                    title: data[i].poiData.name,
                    position: position,
                    icon: Icon.getByType(iconType, 0.5),
                    zIndex: 1
                });

                // We don't make it clickable until we load the place details.
                // TODO Improve this, restored pois should work as when just marked as done.
                data[i].marker.setClickable(false);
                // Mark it as restored so we later can make this clickable.
                data[i].restored = true;

                this.controlledAreas.addPoi(data[i]);

                if (pissed) {
                    this.pissed.add(data[i]);
                }
            }
            this[attributeName] = data;
        },

        unconscious: function() {

            this.router.stop();

            this.clearIntervals();

            $('#text-action').modal('hide');
            $('#game-action').modal('hide');

            $('#status-title').html('You are unconscious! ' +
                '<i style="color: #e15c5c;" class="fa fa-ambulance fa-6" aria-hidden="true"></i>');

            var content = '';

            if (this.state.cFood == 0) {
                content = '<br/><div>You ran out of energy <i class="fa fa-cutlery" style="color: grey;"></i> and you fainted. Recover energy regularly in restaurants.</div>';
            } else {
                // We don't show this message if cFood == 0 because the user ran out of life because of ^.
                content = '<br/><div>You ran out of life <i class="fa fa-heartbeat" style="color: #e15c5c"></i>. Remember to go to the doctor <i class="fa fa-h-square" style="color: #e15c5c;"></i> regularly.</div>';
            }

            content += UI.renderActionButtons([
                {
                    id: 'unconscious-recover',
                    text: 'Recover'
                },
                {
                    id: 'unconscious-newgame',
                    text: 'New game'
                }
            ], 'continue-buttons');

            $('#status-content').html(content);
            $('#status').modal('show');

            $('#unconscious-recover').on('click', function() {
                $('#status').modal('hide');
                this.unconsciousRecover();
                this.startIntervals();
            }.bind(this));

            $('#unconscious-newgame').on('click', function() {
                this.clearGame();
                location.reload();
            }.bind(this));
        },

        unconsciousRecover: function() {

            // It should be enough food to walk Const.unconsciousRecoverDistance meters back to
            // the area where the user get unconscious.
            this.updateState({
                cHealth: Const.initHealth / 2,
                cFood: Const.initFood / 2,
                cWealth: 0
            });

            // Relocate the badass far away.
            var relocation = google.maps.geometry.spherical.computeOffset(
                this.marker.getPosition(),
                Const.unconsciousRecoverDistance,
                Generator.getRandomIndex(360)
            );
            var currentPosition = this.marker.getPosition();
            this.marker.setPosition(relocation);

            // This should force rendering, there is a problem with fitBounds that I need to investigate.
            this.marker.setAnimation(google.maps.Animation.DROP);

            var bounds = new google.maps.LatLngBounds();
            bounds.extend(relocation);
            bounds.extend(currentPosition);
            this.map.fitBounds(bounds);
            // No proper rendering without this (http://stackoverflow.com/questions/16317072/google-maps-api-v3-svg-markers-disappear#comment73825255_20072546)
            this.map.panTo(this.map.getCenter());

            var content = 'You wake up somewhere else and someone have stolen all your money ' +
                '<i class="fa fa-money fa-lg" style="color: green;"></i>';
            UI.showModal(content, 'Continue', 'btn btn-success');
        },

        clearSavedGame: function() {
            localStorage.removeItem('userPhoto');
            localStorage.removeItem('userState');
            localStorage.removeItem('userAttrs');
            localStorage.removeItem('userProperties');
            localStorage.removeItem('userTaxes');
            localStorage.removeItem('userPosition');
            localStorage.removeItem('userAchievements');
            localStorage.removeItem('userOngoingMissions');

            localStorage.removeItem('achievementExtort1');
            localStorage.removeItem('achievementBuy1');
            localStorage.removeItem('achievementSteal1');
            localStorage.removeItem('achievementFight1');
        },

        clearGame: function() {
            this.router.clearRoute();
            this.clearSavedGame();
            this.clearIntervals();

            $('#map').trigger('game:clear');
        },

        refreshAchievementsList: function() {
            var content = '';

            if ($.isEmptyObject(this.achievements)) {
                content += '<p>What do you expect? You have done nothing yet.</p>'

            } else {

                for (var i in this.achievements) {

                    var image = null;
                    if (typeof this.achievements[i].image !== 'undefined') {
                        image = this.achievements[i].image;
                    } else {

                        switch (this.achievements[i].category) {
                            case 'basics':
                                image = '<i class="fa fa-check" style="color: green;"></i>';
                                break;
                            case 'politics':
                                image = '<i class="fa fa-building-o"></i>';
                                break;
                            default:
                                image = '<i class="fa fa-check" style="color: green;"></i>';
                                break;
                        }
                    }

                    content +=
                        '<div class="row">' +
                            '<div class="col-xs-8 text-left">' + this.achievements[i].title + '</div>' +
                            '<div class="col-xs-4">' + image + '</div>' +
                        '</div>';
                }
            }

            content += UI.renderOkButton('Return to game', 'btn btn-warning');

            $('#achievements-content').html(content);
        }
    };

    return User;
});
