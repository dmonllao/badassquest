define(['jquery'], function($) {

    return {

        getRandomElement: function(elements) {
            var randomIndex = Math.floor(Math.random() * elements.length);
            return elements[randomIndex];
        },

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
                width: Math.floor(window.innerWidth * 0.7),
                height: Math.floor(window.innerHeight * 0.6)
            };
        },

        getGameFontSize: function() {
            var size = 50;

            if (window.innerWidth < 480) {
                size = 25;
            } else if (window.innerWidth < 768) {
                size = 40;
            }

            return size;
        }
    };
});
