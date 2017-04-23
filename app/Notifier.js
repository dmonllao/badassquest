define(['bs'], function($) {

    var emptyBoxText = 'Empty box';

    function Notifier(map, controls) {

        this.map = map;
        this.controls = controls;

        // All events based.
        $('#map').on('notification:add', this.add.bind(this));
        $('#map').on('notification:toggle', this.toggle.bind(this));

        return this;
    }

    Notifier.prototype = {

        map: null,
        controls: null,
        notifications: [],

        initPopover: function() {
            $('#notifications').popover({
                delay: {show: 500, hide: 100},
                html: true,
                placement: 'top',
                title: 'Messages',
                content: emptyBoxText,
                trigger: 'manual'
            });

            $('#notifications').on('show.bs.popover', function () {
                this.updateNotificationsContents();
            }.bind(this));
        },

        /**
         * Adds a new notification.
         *
         * @param {Object} notification
         */
        add: function(ev, notification) {

            // Adding it here as #notifications will be available.
            if (!$('#notifications').data('bs.popover')) {
                this.initPopover();
            }

            // We need them sorted by time added. I would improve this if I would expect many notifications.
            var uniqid = Date.now() + Math.floor(Math.random() * 1000);
            this.notifications[uniqid] = notification;

            // If notifications are currently shown we should update the contents.
            this.updateNotificationsContents();

            // We need to force show as the popover should reposition itself even if it is already opened.
            // No need to check this.updateNotificationsContents return as we are adding an item here.
            $('#notifications').popover('show');
        },

        toggle: function() {

            // Adding it here as #notifications will be available.
            if (!$('#notifications').data('bs.popover')) {
                this.initPopover();
            }
            $('#notifications').popover('toggle');
        },

        updateNotificationsContents: function() {

            var content = '<div id="notifications-list">';
            if (this.getNumActiveNotifications() === 0) {
                content = emptyBoxText;
            } else {
                for (var uniqid in this.notifications) {
                    if (this.notifications.hasOwnProperty(uniqid)) {
                        content += this.getNotificationContents(this.notifications[uniqid], uniqid);
                    }
                }
            }
            content += '</div>';

            $('#notifications').data('bs.popover').options.content = content;
            $('#notifications').data('bs.popover').setContent();

            this.controls.updateNotifications(this.getNumActiveNotifications());

            // Ok, I'm a naughty boy... .notification items are already there
            // but we need the new ones we just added in setContent() to be available.
            // The alternative using shown.bs.popover is not working as shown is being
            // triggered also during hidden.
            setTimeout(function() {
                $('.notification').off('click');
                $('.notification').on('click', this.clickNotification.bind(this));
            }.bind(this), 500);
        },

        getNotificationContents: function(notification, uniqid) {
            var id = 'notification-' + uniqid;
            var text = notification.message;

            var div = '<div class="notification" id="' + id + '">';
            if (!notification.notimportant) {
                div += '<strong>';
            }
            div += notification.from + '<br/>' + '<a>' + text + '</a>';
            if (!notification.notimportant) {
                div += '</strong>';
            }
            div += '</div>';

            return div;
        },

        clickNotification: function(ev) {

            // Remove the 'notification-' prefix.
            var index = ev.currentTarget.id.substr(13);

            if (typeof this.notifications[index] === "undefined") {
                console.warn('Duplicated clickNotification click');
                return;
            }

            if (typeof this.notifications[index].callback !== "undefined") {
                // Execute the attached callback if there is any.
                this.notifications[index].callback();
            }

            delete this.notifications[index];

            this.updateNotificationsContents();
            if (this.getNumActiveNotifications() > 0) {
                $('#notifications').popover('show');
            } else {
                $('#notifications').popover('hide');
            }
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
