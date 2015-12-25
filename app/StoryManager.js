define(['bs', 'Const', 'InfoWindow', 'StepsChain', 'story/Free', 'story/PerthUnderground'], function($, Const, InfoWindow, StepsChain, StoryFree, StoryPerthUnderground) {

    // This contains the game instructions, ordered by how important they are to understand how the game works.
    var instructions = [
        'Zoom out to see more nearby places',
        'Move to new areas to reveal new places',
        'Your energy <i style="color: #8397D2;" class="fa fa-cutlery"></i> is in the top left corner, it decreases over time, eat regularly or you will die',
        '<i style="color: red;" class="fa fa-fw fa-heart"></i> is your health. Restaurants or hospitals are good places to recover it',
        'You can switch to other map views using <i style="color: #f5f5f5;" class="fa fa-fw fa-street-view"></i>',
        'Center the map to your location with <i style="color: black;" class="fa fa-fw fa-arrows"></i>',
        'If you are being chased using the street view you will probably get caught and punched'
    ];
    var instructionsInterval;

    var initPromise = $.Deferred();

    function StoryManager(placesService, map, game, user) {
        this.placesService = placesService;
        this.map = map;
        this.game = game;
        this.user = user;
        this.infoPersonWindow = InfoWindow.getInstance();

        // TODO Hardcoded as this is supposed to cover all StoryStep API.
        //this.story = new StoryModernAlchemist(this.user, this.game);
        //this.story = new StoryPerthUnderground(this.user, this.game);
        this.story = new StoryFree(this.user, this.game);

        // Show intro text, attaching start up instructions.
        var content = '<h1 class="story-name">' + this.story.title + '</h1>' +
            '<div class="story-intro">' + this.story.getIntro() + '</div>' +
            '<img src="' + this.user.photo + '" class="step-img img-responsive img-circle"/>';

        $('#text-action-content').html(content);
        $('#text-action').modal('show');

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

        if (this.story.steps.length > 0) {
            this.stepsChain = new StepsChain(this.placesService, this.map, this.game, this.user,
                this.story.steps, this.gameCompleted.bind(this));
            this.stepsChain.setStepLocation();
        }

        return this;
    }

    StoryManager.prototype = {

        map: null,
        game: null,
        user: null,
        placesService: null,

        stepsChain: null,

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

            var html = '<img class="step-img img-responsive img-circle" src="img/chuck.jpg"/><div>' + message + '</div>';
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

            marker.addListener('click', function() {
                this.user.moveTo(marker.getPosition(), function() {

                    // Clickable just once.
                    google.maps.event.clearInstanceListeners(marker);
                    marker.setClickable(false);

                    // Show info, stop animation and remove the marker after
                    // 10 secs, considering 10 secs enough for the user to see the message.
                    this.openInfo(marker, name, html, this.infoPersonWindow);
                    marker.setAnimation(null);
                    setTimeout(function() {
                        this.infoPersonWindow.setMap(null);
                        marker.setMap(null);
                        marker = null;
                        if (typeof callback !== "undefined") {
                            callback();
                        }
                    }.bind(this), 10000);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Copied from the StepsChain.openInfoWindow one, but better to keep them separated
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

            // A small timeout, would be easier for the user to notice the notification shake if we delay this a bit.
            setTimeout(function() {

                // The first one should be quick.
                this.addGameTip();

                // Send game tips every X seconds.
                var instructionsInterval = setInterval(function() {
                    // Add a game tip if there is one.
                    this.addGameTip();
                }.bind(this), Const.instructionsInterval);
            }.bind(this), 2000);
        },

        addGameTip: function() {

            if (instructions.length == 0) {
                clearInterval(instructionsInterval);
                return;
            }

            // Bit of timeout to make it look real.
            $('#map').trigger('notification:add', {
                from: 'Game tip',
                message: instructions.shift()
            });
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
