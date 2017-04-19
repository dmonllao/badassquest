define(['Const', 'Generator', 'InfoWindow', 'Icon'], function(Const, Generator, InfoWindow, Icon) {

    function Router(appMap, isPlayer) {

        directionsService = new google.maps.DirectionsService();

        this.map = appMap;

        if (isPlayer == 'undefined') {
            // Default to no.
            isPlayer = false;
        }
        this.isPlayer = isPlayer;

        var rendererOptions = {
            map : this.map,
            suppressMarkers : true,
            preserveViewport : true
        };

        // Prepare it for later.
        this.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    }

    Router.prototype = {
        directionsDisplay: null,
        endLocation: {},
        polyline: null,
        animationTimer: null,
        shoutInterval: null,
        current: null,
        eol: null,
        step: null,
        tick: 50,

        // @type {google.maps.Map}
        map: null,

        // @type {Boolean} Is this router for the player.
        isPlayer: false,

        // @type {google.maps.Marker}
        marker: null,

        // @type {Callback}
        destinationReachedCallback: null,

        // @type {Callback}
        stepCallback: null,

        // @type {google.maps.DirectionsService}
        directionsService: null,

        // @type {Boolean}
        moving: false,

        route: function(routeMarker, position, stepCallback, destinationCallback, stepLong) {

            this.marker = routeMarker;

            // Overwrite callback values.
            if (typeof destinationCallback === "undefined") {
                destinationCallback = null;
            }
            this.destinationReachedCallback = destinationCallback;

            if (typeof stepCallback === "undefined") {
                stepCallback = null;
            }
            this.stepCallback = stepCallback;

            if (typeof stepLong === "undefined") {
                console.error('You need to set how long the step is. Base it the character speed.');
                // Default value.
                stepLong = 5;
            }
            this.step = stepLong;

            directionsService.route({
                    origin: this.marker.getPosition(),
                    destination: position,
                    travelMode: google.maps.DirectionsTravelMode.WALKING
                },
                this.routeCallback()
            );
        },

        stop: function() {

            // Stop animation. This is done here rather than in clearRoute as
            // it is fine to stop the visible animation only once a destination is
            // reached, not when another location is clicked while moving to a
            // destination.
            this.marker.setAnimation(null);

            this.moving = false;

            // Clean up all other stuff.
            this.clearRoute();
        },

        routeCallback: function() {

            return function(response, status) {

                if (status !== google.maps.DirectionsStatus.OK) {
                    console.error('DirectionsService error: ' + status);
                    this.clearRoute();
                    return;
                }

                // Stop this user active animations.
                if (this.polyline !== null) {
                    this.clearRoute();
                }

                var route = response.routes[0];

                // For each route, display summary information.
                var path = route.overview_path;

                // We should only have a DirectionLeg as we have no waypoints.
                if (route.legs.length > 1) {
                    console.warn('More than 1 leg found');
                    return;
                } else if (route.legs.length === 0) {
                    console.error('No legs found!');
                    return;
                }
                var leg = route.legs[0];

                // Render the directions line.
                this.directionsDisplay.setMap(this.map);
                this.directionsDisplay.setDirections(response);

                // Set the start and end locations.
                this.endLocation.latLng = leg.end_location;
                this.endLocation.address = leg.end_address;

                var steps = leg.steps;

                this.polyline = new google.maps.Polyline({
                    path: [],
                    strokeColor: '#FFFF00',
                    strokeWeight: 3
                });

                for (j=0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k=0;k<nextSegment.length;k++) {
                        this.polyline.getPath().push(nextSegment[k]);
                    }
                }
                this.polyline.setMap(this.map);

                this.startAnimation();

            }.bind(this)
        },

        startAnimation: function() {

            // Refreshing the map because it gets lost after street view.
            this.marker.setMap(this.map);

            // Make the icon bounce.
            this.marker.setAnimation(google.maps.Animation.BOUNCE);

            // This is the total distance to travel.
            this.eol = this.polyline.Distance();

            // People shouting stuff as the badass walk.
            if (this.isPlayer) {
                setTimeout(function() {
                    // We don't start shouting if the user already stopped.
                    if (this.moving) {

                        // First message early so the player don't get bored while walking.
                        this.shout();
                        this.shoutInterval = setInterval(this.shout.bind(this), Const.passingByLapse);
                    }
                }.bind(this), 1000);
            }

            // Flag this route as active.
            this.moving = true;

            // We start from 0.
            this.animate(0);
        },

        /**
         * Returns the current route position + X meters along the route.
         *
         * Falls back to the current position if the user is not on route.
         *
         * Useful for chases that need to guess where the user is going.
         *
         * @param {!number} distanceFromPosition
         * @return {google.maps.LatLng}
         */
        getFuturePosition: function(distanceFromPosition) {

            if (this.eol === null) {
                return this.marker.getPosition();
            }

            // Limit it to the end.
            var futurePoint = this.current + distanceFromPosition;
            if (futurePoint > this.eol) {
                futurePoint = this.eol;
            }

            return this.polyline.GetPointAtDistance(futurePoint);
        },

        animate: function(distance) {

            // Update the current distance.
            this.current = distance;

            // Execute the step callback before anything else.
            // We arrived.
            if (distance > this.eol) {
                this.done(this.endLocation.latLng);
                return;
            }

            // @type {google.maps.LatLng}
            var point = this.polyline.GetPointAtDistance(distance);

            // Update the marker position.
            this.marker.setPosition(point);

            // Execute callback after setting the position.
            if (this.stepCallback !== null) {
                if (this.stepCallback(this) === false) {
                    // If the callback returns false we stop.
                    return;
                }
            }

            // In tick milliseconds we call this again moving to the next step.
            this.animationTimer = setTimeout(function() {
                this.animate(distance + this.step);
            }.bind(this), this.tick);
        },

        done: function(position) {

            this.stop();

            // Execute the caller callback once all done.
            if (this.destinationReachedCallback) {
                this.destinationReachedCallback(position);
            }
        },

        /**
         * Clears the current route.
         */
        clearRoute: function() {

            // Remove DirectionsRenderer.
            this.directionsDisplay.setMap(null);

            // Clear polylines and stop scheduled animation.
            clearTimeout(this.animationTimer);

            // Clear shouting people.
            setTimeout(function() {
                // Same delay (+1) than in startAnimation, otherwise we may clear the route
                // before the interval starts.
                clearInterval(this.shoutInterval);
            }.bind(this), 1001);

            if (this.polyline !== null) {
                this.polyline.setMap(null);
                this.polyline = null;
            }

            this.eol = null;
            this.current = null;
            this.endLocation = {};
        },

        shout: function() {

            // Fake marker just to shout.
            var marker = new google.maps.Marker({
                position: this.marker.getPosition(),
                map: this.map,
                icon: Icon.getByType('comment', 0.5)
            });

            InfoWindow.openInfoInstance({
                map: this.map,
                marker: marker,
                content: Generator.getRandomPedestrianLine(),
                delay: 2000,
                closedCallback: function() {
                    // Free memory.
                    marker.setMap(null);
                    delete marker;
                }
            });

        }
    };

    return Router;
});
