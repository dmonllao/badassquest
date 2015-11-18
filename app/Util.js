define(['jquery'], function($) {

    return {
        /**
         * Depends on the window size.
         */
        getImageSize: function() {
            return {
                width: Math.floor(window.innerWidth * 0.5),
                height: Math.floor(window.innerHeight * 0.5)
            };
        },

        getGameSize: function() {
            return {
                width: Math.floor(window.innerWidth * 0.8),
                height: Math.floor(window.innerHeight * 0.8)
            };
        }
    };
});
