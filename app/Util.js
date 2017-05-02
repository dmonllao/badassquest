define(['bs'], function($) {

    return {

        /**
         * Depends on the window size.
         */
        getImageSize: function() {

            var widthProportion = 0.5;
            var heightProportion = 0.5;

            var size = {
                width: Math.floor(window.innerWidth * widthProportion),
                height: Math.floor(window.innerHeight * heightProportion)
            };

            return size;
        },

        getGameSize: function() {
            return {
                width: Math.floor(window.innerWidth * 0.8),
                height: Math.floor(window.innerHeight * 0.7)
            };
        },

        getGameFontSize: function() {
            var size = 40;

            if (window.innerWidth < 480) {
                size = 25;
            } else if (window.innerWidth <= 768) {
                size = 30;
            }

            return size;
        },

        getGameHealthBarHeight: function() {
            var size = 30;
            if (window.innerWidth < 480) {
                size = 12;
            } else if (window.innerWidth <= 768) {
                size = 20;
            }
            return size;
        },

        getGameHealthBarWidth: function() {
            var size = 300;
            if (window.innerWidth < 480) {
                size = 120;
            } else if (window.innerWidth <= 992) {
                size = 200;
            }
            return size;
        },

        getGameHealthBarImageSize: function() {
            var size = 40;
            if (window.innerWidth < 480) {
                size = 20;
            } else if (window.innerWidth <= 992) {
                size = 30;
            }
            return size;
        },

    };
});
