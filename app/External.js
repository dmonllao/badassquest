define(['bs', 'Const', 'Util', 'Map'], function($, Const, Util, Map) {

    // Bunch of static methods.
    return {

        /**
         * @return Promise
         */
        getWikipediaInfo: function(name) {
            var promise = new $.Deferred();

            $.getJSON('https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&callback=?&exintro=&explaintext=1&exsentences=3&titles=' + name)
                .done(function(data) {
                    var pageKey = Object.keys(data.query.pages)[0];
                    if (pageKey === "-1") {
                        // This page does not have a wikipedia page.
                        promise.reject();
                        return;
                    }

                    // Skip disambiguations.
                    if (data.query.pages[pageKey].extract.indexOf('may refer to') === -1) {
                        promise.reject();
                        return;
                    }

                    promise.resolve(data.query.pages[pageKey].extract);
                    return;
                });

            return promise;
        },

        getLocationImage: function(locationName) {

            var promise = $.Deferred();

            var placesService = Map.getPlacesService();
            placesService.textSearch({query: locationName}, function(results, status) {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                    promise.reject();
                } else if (!results[0].photos) {
                    promise.reject();
                } else {
                    // First picture of the first result, what is life without risk LOL.
                    var photoUrl = results[0].photos[0].getUrl({'maxWidth': 400});

                    // No cross domain.
                    var re = /^https:/g;
                    photoUrl.replace(re, 'http:');

                    console.log(locationName + ' - ' + photoUrl);
                    promise.resolve(photoUrl);
                }
            });

            return promise;
        },

        getStreetViewImage: function(position, width, height) {

            if (!width || !height) {
                var size = Util.getImageSize();

                if (!width) {
                    width = size.width;
                }
                if (!height) {
                    height = size.height;
                }
            }

            return 'https://maps.googleapis.com/maps/api/streetview?size=' + width + 'x' + height + '&location=' + position + '&pitch=10' +
                '&key=AIzaSyCPp5yVSIGbV54-tumH4Zay61o9xpy_1qw'
        }
    }
});
