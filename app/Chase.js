define(['bs', 'Const', 'InfoWindow', 'fontawesomeMarkers', 'Router'], function($, Const, InfoWindow, fontawesomeMarkers, Router) {

    function Chase(map, user, chaseData) {

        // From ChaseTracker.
        this.map = map;
        this.user = user;

        this.data = chaseData;

        this.marker = new google.maps.Marker({
            position: chaseData.start,
            map: this.map,
            title: chaseData.name,
            icon: {
                path: fontawesome.markers.SHIELD,
                scale: 0.5,
                strokeWeight: 0.2,
                strokeColor: 'white',
                strokeOpacity: 1,
                fillColor: '#4169E1',
                fillOpacity: 1,
            },
            animation: google.maps.Animation.DROP,
            zIndex: 8,
            optimized: false,
        });

        setTimeout(function() {
            this.marker.setAnimation(google.maps.Animation.BOUNCE);
        }.bind(this), 2000);

        this.router = new Router(this.map);
    }

    Chase.prototype = {
        map: null,
        user: null,

        marker: null,
        data: null,
        router: null,
        timeStart: null,
        nReroutes: 0,
        infoWindow: null,
        start: function() {

            this.infoWindow = InfoWindow.openInfoInstance({
                map: this.map,
                marker: this.marker,
                content: 'Hey! Where are you going? I will catch you!',
                delay: 10000
            });

            // We wait 3 seconds to start chasing the user.
            setTimeout(function() {

                this.nReroutes = 1;
                this.timeStart = Date.now();

                // We start following the user the callback should use the chase object context.
                // The destination considers that the user might be in-route.
                this.router.route(
                    this.marker,
                    this.user.router.getFuturePosition(80),
                    this.check.bind(this),
                    this.update.bind(this),
                    this.data.speed
                );

            }.bind(this), Const.chaseStartDelay);

        },

        update: function() {

            // We stop if a duration was specified.
            if (typeof this.data.duration !== "undefined" && (Date.now() - this.data.duration) > this.timeStart) {

                this.stop();

                // We only remove when the chase is finished.
                $('#map').trigger('chase:remove', this.data.id);
                return;
            }

            // We stop after X reroutes if it was specified.
            if (typeof this.data.reRouteLimit !== "undefined" && (this.nReroutes >= this.data.reRouteLimit)) {

                this.stop();

                // We only remove when the chase is finished.
                $('#map').trigger('chase:remove', this.data.id);
                return;
            }

            // The destination considers that the user might be in-route.
            this.router.route(
                this.marker,
                this.user.router.getFuturePosition(80),
                this.check.bind(this),
                this.update.bind(this),
                this.data.speed
            );

            this.nReroutes++;
        },

        stop: function() {
            // Defensive programming as we can easily have race conditions when
            // multiple cops chase the user.
            if (this.infoWindow) {
                this.infoWindow.close();
                this.infoWindow.setMap(null);
                this.infoWindow = null;
            }

            this.router.stop();

            if (this.marker) {
                this.marker.setMap(null);
                this.marker = null;
            }
        },

        destroy: function() {
            this.router.destroy();
        },

        /**
         * Checks if the chase marker position reached the user.
         */
        check: function(chaseRouter) {

            var userPosition = this.user.marker.getPosition();
            var chasePosition = chaseRouter.marker.getPosition();

            // Visually these Const.closePosition meters in the map looks like really close.
            if (chasePosition.distanceFrom(userPosition) <= Const.closePosition) {

                // Return false if the user has been caught.
                $('#map').trigger('chase:caught');

                this.data.caughtCallback();

                return false;
            }

            return true;
        }
    };

    return Chase;
});
