define(['bs', 'Const', 'UI', 'Map', 'InfoWindow', 'MissionsChain', 'story/Free', 'story/PerthUnderground', 'story/ForPresident'], function($, Const, UI, Map, InfoWindow, MissionsChain, StoryFree, StoryPerthUnderground, StoryForPresident) {

    // This contains the game instructions, ordered by how important they are to understand how the game works.
    var instructions = [
        '<i class="fa fa-circle-o" aria-hidden="true"></i> Click on the map to move around and to reveal new places',
        '<i class="fa fa-circle-o" aria-hidden="true"></i> Zoom out to see more nearby places. Center the map with <i style="color: black;" class="fa fa-fw fa-arrows"></i>',
        '<i class="fa fa-circle-o" aria-hidden="true"></i> Gain control of city areas by extorting people or buying places',
        '<i class="fa fa-circle-o" aria-hidden="true"></i> Your energy <i style="color: #8397D2;" class="fa fa-cutlery"></i> decreases over time, eat regularly or you will die',
        '<i class="fa fa-circle-o" aria-hidden="true"></i> <i style="color: red;" class="fa fa-fw fa-heart"></i> is your health. Recover it in restaurants or hospitals',
    ];

    var initPromise = $.Deferred();

    function StoryManager(map, game, user) {
        this.map = map;
        this.game = game;
        this.user = user;
        this.infoPersonWindow = InfoWindow.getInstance();

        // TODO Hardcoded as this is supposed to cover all Mission API.
        //this.story = new StoryModernAlchemist(this.user, this.game);
        //this.story = new StoryPerthUnderground(this.user, this.game);
        //this.story = new StoryFree(this.user, this.game);
        this.story = new StoryForPresident(this.user, this.game);

        // Show intro text.
        var content = '<h1 class="story-name">' + this.story.title + '</h1>' +
            '<div class="story-intro">' + this.story.getIntro() + '</div>' +
            '<img src="' + this.user.photo + '" class="big-centered-img img-responsive img-circle"/>';
        UI.showModal(content);

        // Set the story initial position.
        this.map.setZoom(this.story.zoom);
        if (this.story.initialPosition) {
            this.setPosition(new google.maps.LatLng(this.story.initialPosition));
        } else {
            // Set a nice background while the user selects a position.
            this.map.setCenter(Const.defaultMapCenterBackground);
            this.user.setPosition(Const.defaultMapCenterBackground);
            this.story.getPosition(this.map, initPromise, this.setPosition.bind(this));
        }

        if (this.story.missions.length > 0) {
            var missionsChain = new MissionsChain(this.map, this.game, this.user,
                this.story.missions, this.gameCompleted.bind(this));
            missionsChain.setMissionLocation();
        }

        // Allow stories to execute extra stuff.
        if (typeof this.story.ready !== "undefined") {
            this.story.ready();
        }

        return this;
    }

    StoryManager.prototype = {

        map: null,
        game: null,
        user: null,

        story: null,

        infoPersonWindow: null,

        /**
         * Returns the initialisation promise.
         *
         * It might be already resolved if the story sets a fixed initial
         * position, otherwise we need to wait until we get user input.
         */
        init: function() {
            return initPromise;
        },

        /**
         * Sets the inital game position. This is when the game really starts.
         * @param {google.maps.LatLng} LatLng, would not work using {lat:, lng}.
         */
        setPosition: function(position) {

            // Set the user position and center there the map.
            this.user.setPosition(position);
            this.map.setCenter(position);
            this.map.getStreetView().setPosition(position);

            google.maps.event.addListenerOnce(this.map, 'idle', function() {
                // After zoom and center is set.
                var text = 'Hey! You look exactly like my dead son! Are you new in the city? I should adopt you, keep my phone number, I will contact you.';
                this.addInfoPerson(position, text, function() {
                    $('#map').trigger('notification:add', {
                        from: 'Chuck Norris',
                        message: 'Explore the city for a while, I hope you survive... catch you later amigou',
                    });
                });
            }.bind(this));

            this.addGameTips();

            // Let other components know that we already have the position.
            initPromise.resolve(position);
        },

        addInfoPerson: function(userPosition, message, callback) {

            // The info guy should appear close enough to the user and inside the map bounds.
            var bounds = this.map.getBounds();

            // Reducing the distance as the the corner is out of the map. It does not matter if chuck is not in
            // a road, the user will get that they should click there
            var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(userPosition, bounds.getNorthEast()).toFixed() * 0.5);
            var chuckPosition = google.maps.geometry.spherical.computeOffset(userPosition, distance, 45);

            var html = '<img class="big-centered-img img-responsive img-circle" src="img/chuck.jpg"/><div>' + message + '</div>';
            // Chuck Norris will give you some info.
            var name = 'Chuck Norris';
            var marker = new google.maps.Marker({
                map: this.map,
                title: name,
                position: chuckPosition,
                icon: {
                    url: 'img/chuck.jpg',
                    scaledSize: new google.maps.Size(40, 40),
                },
                zIndex: 7
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);

            var self = this;
            marker.addListener('click', function() {
                self.user.moveTo(marker.getPosition(), function() {

                    // Clickable just once.
                    google.maps.event.clearInstanceListeners(marker);
                    marker.setClickable(false);

                    // Show info, stop animation and remove the marker after
                    // 10 secs, considering 10 secs enough for the user to see the message.
                    self.openInfo(marker, name, html, self.infoPersonWindow);
                    marker.setAnimation(null);
                    setTimeout(function() {
                        self.infoPersonWindow.setMap(null);
                        marker.setMap(null);
                        marker = null;
                        if (typeof callback !== "undefined") {
                            callback();
                        }
                    }, 10000);
                });
            });
        },

        /**
         * Copied from the MissionsChain.openInfoWindow one, but better to keep them separated
         * we might want to change all the styling.
         */
        openInfo: function(marker, name, contents, infoWindow) {

            // Initialise it if required.
            if (!infoWindow) {
                infoWindow = InfoWindow.getInstance();
            }

            var content = '<h3>' + name + '</h3>' +
                '<div class="infowindow-content">' + contents + '</div>';

            InfoWindow.open({
                map: this.map,
                marker: marker,
                content: content,
                infoWindow: infoWindow,
            });

            return infoWindow;
        },

        addGameTips: function() {

            setTimeout(function() {
                var content = '<h1>Instructions</h1>' +
                    '<div class="text-left"><ul class="list-unstyled"><li>' + instructions.join('</li><li>') + '</li></ul></div>';
                UI.showModal(content, '<i class="fa fa-check"></i>');
            }, 2000);
        },

        gameCompleted: function() {
            // Game completed.
            $('#status-title').html('The end');
            $('#status-content').html(this.story.getTheEnd());
            $('#status').modal('show');
        }
    };

    return StoryManager;
});
