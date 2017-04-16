define(['bs', 'Const', 'Icon', 'Generator', 'PoiTypes', 'Map', 'MissionsSetGenerator', 'External'], function($, Const, Icon, Generator, PoiTypes, Map, MissionsSetGenerator, External) {

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
                var completedCallback = function() {
                    // Notification and modal for congrats.
                    $('#map').trigger('notification:add', {
                        from: '<img src="' + politic.image + '" class="img-circle notification-img"> ' + politic.name,
                        message: 'Hey badass, I am getting old and grumpy. I want you to be my successor, you deserve it. See you around.'
                    });

                    setTimeout(function() {
                        var content = 'Congratulations! You now rule over ' + politic.location + '. You are the ' + politic.role + '.';
                        if (politic.locationImage) {
                            content += '<img src="' + politic.locationImage + '" class="big-centered-img img-responsive img-circle">';
                        }
                        $('#text-action-content').html(content);
                        $('#text-action').modal('show');
                    }, 2000);
                };

                // Too many binds required.
                var self = this;

                this.getPlaces(newLevel).done(function(places) {
                    $('#map').trigger('notification:add', {
                        from: '<img src="' + politic.image + '" class="img-circle notification-img"> ' + politic.name + ' - ' + politic.location + ' ' + politic.role,
                        message: 'Hi, I\'ve heard you are a badass, you should secretly work for me. Reply as soon as possible.',
                        callback: function() {
                            var missionsGenerator = new MissionsSetGenerator(self.map, self.game, self.user, politic, completedCallback.bind(this));
                            missionsGenerator.create(places);
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
                                    var locationType = component.types[y];

                                    // We skip it if we are not interested in this locationType.
                                    if (adminLevels.indexOf(locationType) === -1) {
                                        continue;
                                    }

                                    // We skip it if it is already set.
                                    if (posPolitics[locationType]) {
                                        continue;
                                    }
                                    posPolitics[locationType] = component.long_name;
                                }
                            }
                        }
                    }
                }

                // Depending on the locationType and the user level we require a level
                // or another to make the politic contact the user.
                for (var locationType in posPolitics) {
                    if (posPolitics.hasOwnProperty(locationType)) {
                        this.addPolitic(locationType, posPolitics[locationType]);
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
         * @param {String} locationType Politic area of control.
         * @param {String} location An address (read setPolitics, quite fragile)
         */
        addPolitic: function(locationType, location) {
            var politic = {
                name: Generator.getRandomName(),
                locationType: locationType,
                role: this.locationTypeRole(locationType),
                location: location
            };

            // Character picture.
            Generator.getRandomPersonImage().done(function(image) {
                politic.image = image;
            });

            // Location picture.
            External.getLocationImage(location).done(function(imageUrl) {
                politic.locationImage = imageUrl;
            });

            // We already filtered locationTypes not part of adminLevels.
            var level = Const.politicLevels[locationType];

            if (!this.politics[level]) {
                this.politics[level] = [];
            }

            this.politics[level].push(politic);
        },

        locationTypeRole: function(locationType) {
            switch (locationType) {
                case 'locality':
                    return 'major';
                case 'administrative_area_level_3':
                    return 'governor';
                case 'administrative_area_level_2':
                    return 'governor';
                case 'administrative_area_level_1':
                    return 'state governor';
                case 'country':
                    return 'president';
            }

            // Crappy fallback.
            console.warn('Couldn\'t determine the role for ' + locationType + ' location type');
            return 'manager';
        },

    };

    return PoliticsManager;
});
