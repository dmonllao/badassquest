define(['bs', 'Const', 'InfoWindow', 'fontawesome', 'Router'], function($, Const, InfoWindow, fontawesome, Router) {

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
                path: fontawesome.markers.EXCLAMATION,
                scale: 0.5,
                strokeWeight: 0.2,
                strokeColor: 'white',
                strokeOpacity: 1,
                fillColor: 'black',
                fillOpacity: 1,
            },
            zIndex: 8
        });

        this.infoWindow = InfoWindow.getInstance({
            content: '<h4>Hey! Where are you going? I will catch you!</h4>'
        }, false);

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

            this.infoWindow.open(this.map, this.marker);

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
            this.marker.setMap(null);
            this.router.stop();
        },

        /**
         * Checks if the chase marker position reached the user.
         */
        check: function(chaseRouter) {

            var userPosition = this.user.marker.getPosition();
            var chasePosition = chaseRouter.marker.getPosition();

            // Visually these Const.closePosition meters in the map looks like really close.
            if (chasePosition.distanceFrom(userPosition) <= Const.closePosition) {

                this.data.caughtCallback();

                // Return false if the user has been caught.
                $('#map').trigger('chase:caught');
                return false;
            }

            return true;
        }
    };

    return Chase;
});
