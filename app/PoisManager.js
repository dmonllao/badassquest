define(['bs', 'PoiTypes', 'Map', 'Const', 'UI', 'Util', 'InfoWindow', 'External', 'Icon'], function($, PoiTypes, Map, Const, UI, Util, InfoWindow, External, Icon) {

    function PoisManager(map, game, user) {
        this.placesService = Map.getPlacesService();
        this.map = map;
        this.game = game;
        this.user = user;

        // Now that google.maps is available.
        this.infoWindow = InfoWindow.getInstance();

        $('#game-action').on('hidden.bs.modal', function (e) {

            // Cleanup the current state.
            var state = this.game.state.getCurrentState();
            state.finishFight();

            // Move to the empty one.
            this.game.state.start('Empty');
        }.bind(this));

        $('#map').on('move:finished', this.getNearbyPois.bind(this));

        // Add existing markers to the markers list.
        // We don't include properties here, we will later add the click
        // listener so users can eat at their properties.
        for (var i in this.user.taxes) {
            this.markers[i] = this.user.taxes[i].marker;
        }
        return this;
    }

    PoisManager.prototype = {
        placesService: null,
        map: null,
        user: null,
        game: null,

        markers: [],

        lastAddPoisPosition: null,

        // Is the loading icon spinning.
        loadingShown: false,

        // @type {google.maps.InfoWindow}
        infoWindow: null,

        // Bypass for addNearbyPois.
        getNearbyPois: function(ev) {

            var userPosition = this.user.marker.getPosition();

            // We want to compare how far the destination is comparing with the last position where we added points of interest.
            // This process is not ideal, imagine a user walking in circles, we will always look for new POIs but
            // it would not be needed, as we already added them.
            // TODO This could be improved by storing a list of all reached positions and compare distances
            // between position var and each of them.
            var distance;
            if (this.lastAddPoisPosition) {
                distance = google.maps.geometry.spherical.computeDistanceBetween(this.lastAddPoisPosition, userPosition).toFixed();
            } else {
                // More than Const.poisRadius for sure.
                distance = 1000000;
            }

            // Add new POIs if the current position and the previous one are far enough.
            // Better to update it more frequently than what we should strictly do.
            if (distance > Const.poisRadius / 2) {
                this.clearFarPois(userPosition);
                this.addNearbyPois(userPosition);
                this.lastAddPoisPosition = userPosition;
            }

        },

        clearFarPois: function(position) {
            for (var place_id in this.markers) {
                if (this.markers.hasOwnProperty(place_id)) {

                    // Can't remove properties and taxes.
                    if (typeof this.user.taxes[place_id] !== 'undefined' || typeof this.user.properties[place_id] !== 'undefined') {
                        continue;
                    }

                    var distance = google.maps.geometry.spherical.computeDistanceBetween(this.markers[place_id].marker.getPosition(), position).toFixed();
                    if (distance > Const.clearPoisRadius / 2) {
                        // Remove the marker.
                        google.maps.event.clearInstanceListeners(this.markers[place_id].marker);
                        this.markers[place_id].marker.setMap(null);
                        this.markers[place_id].marker = null;
                        delete this.markers[place_id];
                    }
                }
            }
        },

        addNearbyPois: function(position) {

            this.lastAddPoisPosition = this.user.marker.getPosition();

            this.showLoading();

            var searchGroups = PoiTypes.getSearchGroups();
            for (var i in searchGroups) {
                this.placesService.nearbySearch({
                    location: position,
                    radius: Const.poisRadius,
                    types: searchGroups[i],
                }, this.addPois.bind(this));
            }
        },

        addPois: function(results, status) {

            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                this.hideLoading();
                return;
            } else if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error('PlacesService error: ' + status);
                return;
            }

            // A marker for each result.
            for (var i = 0; i < results.length; i++) {
                this.addMarker(results[i]);
            }

            // Once one of the calls is done (see this.addNearbyPois) we hide the loading.
            this.hideLoading();
        },

        addMarker: function(data) {

            // Check that it is not already on the map.
            if (typeof this.markers[data.place_id] !== "undefined") {
                return;
            }

            // Check that it is not already a property or someone paying taxes.
            if (typeof this.user.taxes[data.place_id] !== 'undefined') {
                return;
            }

            var marker = null;
            if (typeof this.user.properties[data.place_id] !== 'undefined') {
                // Reference to the existing one.
                // We only reach this point after restoring the property, once
                // we add click listeners it is part of this.markers and next
                // places load will be skipped.
                marker = this.user.properties[data.place_id].marker;
                marker.setClickable(true);
            }

            // Create the marker.
            if (marker === null) {
                // If it is an existing property we already have a marker.
                marker = new google.maps.Marker({
                    map: this.map,
                    title: data.name,
                    position: data.geometry.location,
                    icon: Icon.get(data.types, PoiTypes.get(), 0.5),
                    zIndex: 1
                });
            }

            this.markers[data.place_id] = {
                marker: marker
            };

            // Load place details while moving but only show details once arrived.
            var self = this;
            marker.addListener('click', function(e) {
                var placeDetails = self.loadPlaceDetails(data, marker);
                self.user.moveTo(e.latLng, function() {
                    placeDetails.done(self.showPlaceDetails.bind(self));
                });
            });
        },

        loadPlaceDetails: function(data, marker) {

            var promise = $.Deferred();

            var request = {placeId: data.place_id};
            var propertyActions = PoiTypes.getPropertyActions();

            // Ok, I don't like this, but I don't want 30 bind(this).
            var self = this;

            this.placesService.getDetails(request, function(place, status) {

                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error('PlacesService error: ' + status);
                    promise.reject();
                }

                // Get the first valid place type and get the valid actions for that type.
                var actions = self.getActions(place.types, place, marker);

                var size = Util.getImageSize();
                var content = '<h3>' + data.name + '</h3>' +
                    '<img class="poi-img" src="' + External.getStreetViewImage(data.vicinity, size.width, size.height) + '"' +
                        ' width="' + size.width + '" height="' + size.height + '"/>';

                // Does the user own the place?
                var owned = false;
                if (self.user.getProperties()[data.place_id]) {
                    owned = true;
                }

                if (actions.length > 0) {
                    var style = 'max-width: ' + size.width + 'px;';
                    content = content + '<div class="action-buttons" style="' + style + '">';
                    for(var i = 0; i < actions.length; i++) {

                        // Only some actions are available once the property was bought.
                        // In future there might be actions available only once the property is bought.
                        if (!owned || propertyActions.indexOf(actions[i].getName()) !== -1) {
                            var id = 'id-action-' + i;
                            var buttonClass = 'start-action btn ' + UI.getActionButtonStyle(i);
                            content = content + '<button id="' + id + '" class="' + buttonClass + '">' +
                                actions[i].getVisibleName() + '</button>';
                        }
                    }
                    content = content + '</div>';
                }

                promise.resolve(marker, content, actions);
            });

            return promise;
        },

        showPlaceDetails: function(marker, content, actions) {

            var self = this;

            InfoWindow.open({
                map: this.map,
                marker: marker,
                content: content,
                infoWindow: this.infoWindow,
            });

            // Clear remaining listeners as we don't want them queued.
            google.maps.event.clearListeners(this.infoWindow, 'domready');
            google.maps.event.addListener(this.infoWindow, 'domready', function() {
                // On click we render the selected action.
                $('.start-action').click(function(ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    self.infoWindow.close();

                    // Get the selected action.
                    var action = actions[ev.target.id.substr(10)];
                    action.start();
                });
            });
        },

        /**
         * List of the places we are interested on.
         */
        getTypesList: function() {
            var list = [];
            var poiTypes = PoiTypes.get();
            $.each(poiTypes, function(index, object) {
                list.push(index);
            });
            return list;
        },

        getActions: function(placeTypes, poiData, marker) {

            var typeActions = PoiTypes.getActions(placeTypes);

            // We create the instances here.
            var instances = [];
            for(var i = 0; i < typeActions.length; i++) {
                var action = new typeActions[i](this.user, this.game, poiData, marker);
                instances.push(action);
            }
            return instances;
        },

        showLoading: function() {
            if ($('#text-action').data('bs.modal').isShown === false) {

                document.getElementById('text-action-content').innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
                $('#text-action').modal('show');

                this.loadingShown = true;
            }
        },

        hideLoading: function() {
            if (this.loadingShown) {

                $('#text-action').modal('hide');

                this.loadingShown = false;
            }
        }

    };

    return PoisManager;
});
