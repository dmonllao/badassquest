define(['bs', 'Const', 'Icon', 'Generator', 'PoiTypes', 'Map', 'MissionsSet'], function($, Const, Icon, Generator, PoiTypes, Map, MissionsSet) {

    var adminLevels = ['locality', 'administrative_area_level_3', 'administrative_area_level_2', 'administrative_area_level_1', 'country'];

    function PoliticsManager(map, game, user) {
        this.placesService = Map.getPlacesService();
        this.map = map;
        this.game = game;
        this.user = user;

        this.geocoder = Map.getGeocoder();

        $('#map').on('user:levelup', this.checkPolitics.bind(this));

        return this;
    }

    PoliticsManager.prototype = {
        placesService: null,
        geocoder: null,
        map: null,
        game: null,
        user: null,

        politics: {},

        checkPolitics: function(ev, newLevel) {

            if (!this.politics[newLevel]) {
                return false;
            }

            // Add all politics at this level.
            for (var i in this.politics[newLevel]) {

                var politic = this.politics[newLevel][i];
                var iconPromise = Generator.getRandomPersonImage();
                var completedCallback = function() {
                    $('#map').trigger('notification:add', {
                        from: politic.name,
                        message: 'Hey bad ass, I get retired. I want you to be my successor, you deserve it. See you.'
                    });
                };

                var placesPromise = this.getPlaces(newLevel);

                // Too many binds required.
                var self = this;

                $.when(iconPromise, placesPromise)
                .done(function(icon, places) {
                    $('#map').trigger('notification:add', {
                        from: politic.name + ' - ' + politic.location + ' capo',
                        message: 'Hi, I\'ve heard you are a bad ass, you should work for me. Reply as soon as possible.',
                        callback: function() {
                            var missions = new MissionsSet(self.map, self.game, self.user, politic.name, icon, completedCallback.bind(this));
                            missions.create(places);
                        }
                    });
                })
                .fail(function() {
                    return;
                });
            }
        },

        getPlaces: function(level) {
            var promise = $.Deferred();

            this.placesService.nearbySearch({
                location: this.user.marker.getPosition(),
                radius: 4000,
                types: PoiTypes.getMissionsTypes()
            }, function(places, status) {
                if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    console.error('No results getting politics places');
                    promise.reject();
                    return;
                } else if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.log('PlacesService error: ' + status);
                    promise.reject();
                    return;
                }

                // The length depends on the level where the politician contacts you.
                var limits = PoiTypes.getMissionLimits(level);
                for (var i in places) {
                    // TODO Apply limits. 
                }
                promise.resolve(places);

            }.bind(this));

            return promise;
        },

        setPolitics: function(position) {
            this.geocoder.geocode({location: position}, function(results, status) {
                if (status !== google.maps.GeocoderStatus.OK) {
                    console.error('Geocoder error: ' + status);
                    return;
                }

                // Different than this.politics as we need to limit 1 per level for this position.
                var posPolitics = [];

                // Note that this is fragile as we are not including the whole set.
                // We could try to reduce the number of iterations but considering the
                // amount of records I don't think it is worth.
                for (var i in results) {
                    if (results[i].address_components) {
                        for (var j in results[i].address_components) {
                            var component = results[i].address_components[j];
                            if (component.types) {
                                for (var y in component.types) {
                                    var type = component.types[y];

                                    // We skip it if we are not interested in this type.
                                    if (adminLevels.indexOf(type) === -1) {
                                        continue;
                                    }

                                    // We skip it if it is already set.
                                    if (posPolitics[type]) {
                                        continue;
                                    }
                                    posPolitics[type] = component.long_name;
                                }
                            }
                        }
                    }
                }

                // Depending on the type and the user level we require a level
                // or another to make the politic contact the user.
                for (var type in posPolitics) {
                    if (posPolitics.hasOwnProperty(type)) {
                        this.addPolitic(type, posPolitics[type]);
                    }
                }
            }.bind(this));
        },

        /**
         * Creates a politic based on the area they control.
         *
         * We decide here, when setPolitics is called, what level
         * would need the user to be contacted by the politic.
         *
         * @param {String} type Politic area of control.
         * @param {String} location An address (read setPolitics, quite fragile)
         */
        addPolitic: function(type, location) {
            var politic = {
                name: Generator.getRandomName(),
                type: type,
                location: location
            };

            // We already filtered types not part of adminLevels.
            var level = Const.politicLevels[type];

            if (!this.politics[level]) {
                this.politics[level] = [];
            }

            this.politics[level].push(politic);
        }
    };

    return PoliticsManager;
});
