define(['bs'], function($) {

    function Notifier(map, controls) {

        this.map = map;
        this.controls = controls;

        // All events based.
        $('#map').on('notification:add', this.add.bind(this));
        $('#map').on('notification:toggle', this.toggle.bind(this));

        // We need the control to be loaded.
        google.maps.event.addListenerOnce(this.map, 'idle', function() {
            $('#notifications').popover({
                delay: {show: 500, hide: 100},
                html: true,
                placement: 'left',
                title: 'Messages',
                trigger: 'manual'
            });

            $('#notifications').on('shown.bs.popover', function () {
                // Who cares about performance.
                $('.notification').off('click');
                $('.notification').on('click', this.clickNotification.bind(this));
            }.bind(this));

        }.bind(this));

        return this;
    }

    Notifier.prototype = {

        map: null,
        controls: null,
        notifications: [],

        /**
         * Adds a new notification.
         *
         * @param {Object} notification
         */
        add: function(ev, notification) {

            // We need them sorted by time added. I would improve this if I would expect many notifications.
            var uniqid = Date.now() + Math.floor(Math.random() * 1000);
            this.notifications[uniqid] = notification;

            // Hide it as it might be opened and show non updated results, the proper
            // alternative would be to update the popover contents here.
            $('#notifications').popover('hide');

            // Show popover.
            this.controls.updateNotifications(this.getNumActiveNotifications());
        },

        toggle: function() {

            var content = '';
            if (this.getNumActiveNotifications() === 0) {
                content = 'Empty box';
            } else {
                for (var i in this.notifications) {
                    if (this.notifications.hasOwnProperty(i)) {
                        var id = 'notification-' + i;
                        var text = this.notifications[i].message;
                        content += '<div>' +
                            '<b>' + this.notifications[i].from + ': </b>' +
                            '<a href="#" class="notification" id="' + id + '">' + text + '</a></div>';
                    }
                }
            }

            $('#notifications').data('bs.popover').options.content = content;
            $('#notifications').popover('toggle');
        },

        clickNotification: function(ev) {

            // Remove the 'notification-' prefix.
            var index = ev.target.id.substr(13);

            if (typeof this.notifications[index] === "undefined") {
                console.warn('Duplicated clickNotification click');
                return;
            }

            if (typeof this.notifications[index].callback !== "undefined") {
                // Execute the attached callback if there is any.
                this.notifications[index].callback();
            }

            delete this.notifications[index];
            this.controls.updateNotifications(this.getNumActiveNotifications());

            $('#notifications').popover('hide');
        },

        getNumActiveNotifications: function() {
            var count = 0;
            for (var i in this.notifications) {
                if (this.notifications.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        }

    };

    return Notifier;
});
