define(['jquery'], function($) {

    var maxWidth = 654;
    var maxHeight = 740;

    return {

        /**
         * Depends on the window size.
         */
        getImageSize: function() {

            var size = {
                width: Math.floor(window.innerWidth * 0.5),
                height: Math.floor(window.innerHeight * 0.5)
            };

            // Limited by InfoWindow max-height and max-width.
            if (size.width > maxWidth) {
                size.width = maxWidth;
            }
            if (size.height > maxHeight) {
                size.height = maxHeight;
            }
            return size;
        },

        getGameSize: function() {
            return {
                width: Math.floor(window.innerWidth * 0.7),
                height: Math.floor(window.innerHeight * 0.8)
            };
        }
    };
});
