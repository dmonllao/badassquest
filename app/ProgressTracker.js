define(['bs', 'UI', 'Util'], function($, UI, Util) {

    var progressTracking = true;

    var sendRequest = 10;

    var pendingProgress = [];

    var userID = null;
    var token = null;

    // Bunch of static methods.
    ProgressTracker = {

        add: function(category, id, poiData) {

            if (!progressTracking) {
                return false;
            }

            if (typeof FB === "undefined") {
                // Nothing to do if the service was not properly initialised.
                return false;
            }

            // Give some time to assimilate and enjoy the achievement sound.
            if (!userID || !token) {
                setTimeout(function() {
                    FB.getLoginStatus(function(response) {
                        ProgressTracker.getFacebookToken(response);
                    });
                }, 2000);
            }

            pendingProgress.push({
                category: category,
                id: id,
                country: ProgressTracker.getCountryCode(poiData)
            });

            // Send the user progress to the backend.
            if (pendingProgress.length === sendRequest) {
                var request = $.ajax({
                    type: 'POST',
                    url: 'http://localhost:8000/users/add',
                    data: {
                        userid: userID,
                        token: token,
                        achievements: JSON.stringify(pendingProgress)
                    }
                });
                request.done(function(data) {

                    // Remove progress already processed by the backend.
                    pendingProgress = [];

                    if (!data) {
                        // No changes to report.
                        return true;
                    }
                    ProgressTracker.showLeaderBoard(JSON.parse(data));
                    return true;
                }).fail(function(err) {
                    console.log('Server error: ' + err);
                });
            }
        },

        getFacebookToken: function(response) {

            if (response.status !== 'connected') {
                // From https://developers.facebook.com/docs/facebook-login/web
                var content = '<div>Log in to record your achievements and appear on the leaderboard.</div>' +
                    UI.renderActionButtons([{
                        id: 'login-facebook',
                        text: '<i class="fa fa-facebook"></i> Login with Facebook',
                        extraStyles: 'background-color: #3b5998;'
                    }, {
                        id: 'no-login',
                        text: '<i class="fa fa-thumbs-o-down"></i> Maybe later'
                    }], 'continue-buttons');
                UI.showModal(content);

                $('#login-facebook').on('click', function() {
                    FB.login(function(response) {
                       ProgressTracker.getFacebookToken(response);
                    }, {scope: 'public_profile,email'});
                });
                $('#no-login').on('click', function() {
                    progressTracking = false;
                    $('#text-action').modal('hide');
                });

            } else {
                userID = response.authResponse.userID;
                token = response.authResponse.accessToken;
                $('#text-action').modal('hide');
            }
        },

        getCountryCode: function(poiData) {

            for (var i = 0; i < poiData.address_components.length; i++) {
                for (var j = 0; j < poiData.address_components[i].types.length; j++) {
                    if (poiData.address_components[i].types[j] === 'country') {
                        return poiData.address_components[i].short_name;
                    }
                }
            }

            console.log('Poi country can not be determined, default to ES');

            // Default to something.
            return 'ES';
        },

        showLeaderBoard: function(data) {

            // Retrieves the first key, ignore subsequents.
            var category = Object.keys(data.newpositions)[0];

            var url = 'http://localhost:8000/leaders?country=' + data.country + '#' + category;
            var iframeSize = Util.getLeadersBoardSize();

            var msg = 'Leaderboard updates!';
            if (!localStorage.getItem('userMadeLeaderBoard')) {
                msg = 'You made it into the leader board!';
                localStorage.setItem('userMadeLeaderBoard', 1);
            }
            var content = msg + '<iframe src="' + url + '" frameBorder="0" width="' + iframeSize.width +
                '" height="' + iframeSize.height + '"></iframe>';
            UI.showModal(content, 'Close');
        }
    };

    return ProgressTracker;
});
