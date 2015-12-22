(function ($) {
    /**
     * Copied from http://jsfiddle.net/HjFUK/178/ and updated to change
     * the starting side from left to right, initially it will only be
     * used for notifications. We should improve it if we want other elements
     * to be shaked.
     */
    $.fn.shake = function (options) {
        // defaults
        var settings = {
            'shakes': 2,
            'distance': 10,
            'duration': 400
        };
        // merge options
        if (options) {
            $.extend(settings, options);
        }
        // make it so
        var pos;
        return this.each(function () {
            $this = $(this);
            // position if necessary
            pos = $this.css('position');
            if (!pos || pos === 'static') {
                $this.css('position', 'relative');
            }
            // shake it
            for (var x = 1; x <= settings.shakes; x++) {
                $this.animate({ right: settings.distance * -1 }, (settings.duration / settings.shakes) / 4)
                    .animate({ right: settings.distance }, (settings.duration / settings.shakes) / 2)
                    .animate({ right: 0 }, (settings.duration / settings.shakes) / 4);
            }
        });
    };
}(jQuery));
