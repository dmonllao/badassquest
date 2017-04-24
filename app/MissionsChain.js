define(['bs', 'External', 'Icon', 'InfoWindow', 'Map'], function($, External, Icon, InfoWindow, Map) {

    function MissionsChain(map, game, user, employer, missions, completedCallback) {
        this.placesService = Map.getPlacesService();
        this.map = map;
        this.game = game;
        this.user = user;
        this.employer = employer;
        this.missions = missions;
        this.completedCallback = completedCallback;
        return this;
    }

    MissionsChain.prototype = {
        placesService: null,
        map: null,
        game: null,
        user: null,

        markersGarbage: [],

        missions: [],

        currentMission: null,

        // Will run once the set of missions are completed.
        completedCallback: null,

        setMissionLocation: function(mission) {

            if (typeof mission === "undefined") {
                mission = this.getNextMission();
            }

            // Placeid is not required.
            if (mission.placeid) {
                var request = {placeId: mission.placeid};
                this.placesService.getDetails(request, function(placeData, status) {

                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error('PlacesService error: ' + status);
                        return;
                    }

                    this.addMissionLocation(mission, placeData);
                }.bind(this));

            } else {
                this.addMissionLocation(mission);
            }
        },

        getNextMission: function() {
            if (this.currentMission === null) {

                // Preexisting ongoing mission.
                if (this.user.ongoingMissions[this.employer.id]) {
                    this.currentMission = this.user.ongoingMissions[this.employer.id];
                } else {
                    // Fallback to new game and first mission.
                    this.currentMission = 0;
                }
            } else {
                this.currentMission++;
            }

            // Current mission number to storage.
            this.user.ongoingMissions[this.employer.id] = this.currentMission;

            if (typeof this.missions[this.currentMission] === "undefined") {
                return false;
            }

            // Provide data to the mission.
            this.missions[this.currentMission].setUser(this.user);
            this.missions[this.currentMission].setGame(this.game);

            return this.missions[this.currentMission];
        },

        addMissionLocation: function(mission, placeData) {

            // Just an "unideal" default.
            if (typeof placeData === "undefined") {
                placeData = {
                    fakePlace: true,
                    icon: Icon.getByType('idea'),
                    name: 'You arrived'
                };
            }

            // Fallback to the poi marker.
            if (mission.icon === null) {
                // Fallback again to the default icon.
                mission.icon = placeData.icon;
                if (placeData.fakePlace) {
                    console.error('If the mission does not have a placeid you should specify a mission icon');
                }
            }

            // Fallback to the poi name.
            if (mission.name === null) {
                mission.name = placeData.name;
                if (placeData.fakePlace) {
                    console.error('If the mission does not have a placeid you should specify a mission name');
                }
            }

            // Fallback to the poi position.
            if (mission.position === null) {
                if (placeData.fakePlace) {
                    // Here we return because this is a required param, we can not have a generic one.
                    console.error('If the mission does not have a placeid you should specify a mission position');
                    return;
                }
                mission.position = placeData.geometry.location;
            }

            var marker = new google.maps.Marker({
                map: this.map,
                title: mission.name,
                position: mission.position,
                icon: mission.icon,
                zIndex: 7,
                optimized: false,
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);

            // Missions may specify hints.
            if (mission.infoMessage) {
                this.addNotification(mission.infoMessage, mission.position);
            }

            // Click listener.
            marker.addListener('click', function(e) {

                this.user.moveTo(e.latLng, function(position) {

                    // Clean previous missions garbage.
                    this.cleanGarbage();

                    // We show content if required, this might be pre-completed info, post-completed info or any
                    // info during the mission process.
                    var contents = mission.getContents();
                    if (contents) {
                        this.openInfoWindow(marker, mission.name, contents, mission.infoWindow);
                    }

                    // We add this here as a var as we need to access the marker var which
                    // is not available in the mission nor outside this context.
                    var missionCompleteCallback = function(mission) {

                        ga('send', 'event', 'achievement', 'mission completed', mission.name);

                        marker.setAnimation(null);

                        // The mission can decide whether the marker is removed or not.
                        if (mission.cleanIt()) {
                            // We will clean it after next point is reached as otherwise we would
                            // have to deal with onClose infoWindow.
                            this.markersGarbage.push(marker);
                        }

                        this.missionCompleted(mission);
                    }.bind(this);

                    // To execute it after the mission is completed.
                    mission.setCompletedCallback(missionCompleteCallback.bind(this));

                    // It only makes sense when the mission is uncompleted, the mission must control what should be shown
                    // depending on its internal status.
                    if (!mission.isCompleted()) {
                        mission.execute(missionCompleteCallback);
                    }

                }.bind(this));
            }.bind(this));
        },

        cleanGarbage: function() {
            for (var i in this.markersGarbage) {
                // TODO We might want to clean mission data too if garbage remains there.
                this.markersGarbage[i].setMap(null);
            }
        },

        missionCompleted: function(mission) {

            if (mission.doneMessage) {
                this.addNotification(mission.doneMessage);
            }

            var nextMission = this.getNextMission();
            if (nextMission) {
                // Reveal next mission.
                // TODO Play sound.
                // Wait some time before showing the next mission to the user.
                setTimeout(function() {
                    this.setMissionLocation(nextMission);
                }.bind(this), 7000);
            } else {
                this.completedCallback();
            }
        },

        openInfoWindow: function(marker, name, contents, infoWindow) {

            // Initialise it if required.
            if (!infoWindow) {
                infoWindow = InfoWindow.getInstance();
            }

            var content = '<h3>' + name + '</h3>' +
                '<div class="infowindow-content">' + contents + '</div>';

            // Add some wikipedia info if available.
            //var promise = External.getWikipediaInfo(mission.name);
            //promise.done(function(article) {
                //content += '<br/>' + article;
            //}).always(function() {
                InfoWindow.open({
                    map: this.map,
                    marker: marker,
                    content: content,
                    infoWindow: infoWindow,
                });
            //}.bind(this));

            return infoWindow;
        },

        addNotification: function(msgData, position) {

            var callback = function(){};
            if (position) {
                callback = function() {
                    if (this.map.getCenter().distanceFrom(position) > 300) {
                        // Show both current location and position
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(this.map.getCenter());
                        bounds.extend(position);
                        this.map.fitBounds(bounds);
                        // No proper rendering without this (http://stackoverflow.com/questions/16317072/google-maps-api-v3-svg-markers-disappear#comment73825255_20072546)
                        this.map.panTo(this.map.getCenter());
                    } else {
                        this.map.panTo(position);
                    }
                }.bind(this);
            }
            // Bit of timeout to make it look real.
            setTimeout(function() {
                $('#map').trigger('notification:add', {
                    from: msgData.from,
                    message: msgData.message,
                    callback: callback
                });
            }.bind(this), 500);
        }

    };

    return MissionsChain;
});
