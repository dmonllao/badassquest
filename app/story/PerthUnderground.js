define(['jquery', 'story/Base', 'UI', 'Icon', 'InfoWindow', 'StoryStep', 'Foe'], function($, StoryBase, UI, Icon, InfoWindow, StoryStep, Foe) {

    PerthUnderground.prototype = Object.create(StoryBase.prototype);

    function PerthUnderground(user, game) {
        StoryBase.call(this, user, game);

        this.title = 'Perth underground';

        // West Perth.
        this.initialPosition = {lat: -31.948357, lng: 115.8408308};

        // Setting them in here as google.maps will already be available.
        this.steps = [
            // Specify everything in here; name, position and icon have preference over the place ones.
            new StoryStep({
                name: 'Random witness',
                placeid: 'ChIJL_U8syG7MioRJxobWh5So7k',
                position: new google.maps.LatLng(-31.94822952, 115.84812641),
                hint: {
                    from: 'Waiter',
                    message: 'The witness waits for you there'
                },
                icon: Icon.getByType('idea'),
                cleanStep: true,
                info: 'I haven\'t really seen anything, just someone running. Probably worth going to the police station.'
            }),
            // Just custom data, no need to point to real places.
            new StoryStep({
                name: 'Perth Police Station',
                position: new google.maps.LatLng(-31.946606, 115.852482),
                icon: Icon.getByType('police'),
                info: 'That sounds bad mate, second case this week. This is the other family address, you can support each other, go see them.'
            }),
            new StoryStep({
                name: 'The Robinsons house',
                position: new google.maps.LatLng(-31.935394209989067, 115.86165815591812),
                icon: Icon.getByType('home'),
                info: 'Yesterday I received a phone call, don\'t tell anyone, I am too scared to go alone, please come with me; I\'ve marked the position in the map.'
            }),
            // process attr contains the action workflow.
            new StoryStep({
                name: '???',
                position: new google.maps.LatLng(-31.94608420088298, 115.88047921657562),
                icon: Icon.getByFont('EXCLAMATION'),
                cleanStep: true,
                info: '<p>Gimme all you have you cunts!</p>' + UI.renderActionButtons([
                        {
                            id: 'pay',
                            text: 'Do as he said'
                        }, {
                            id: 'fight',
                            text: 'Fight him'
                        }, {
                            id: 'run',
                            text: 'Run!'
                        }
                    ]),
                process: function() {

                    $('#pay').on('click', function(ev) {

                        this.user.updateState({
                            cWealth: 0
                        });
                        InfoWindow.closeAll();
                        $('#text-action-content').html('<p>hehehe, now run with your mummy!</p>');
                        $('#text-action').modal('show');
                    }.bind(this));

                    $('#fight').on('click', function(ev) {

                        var foe = new Foe({
                            name: 'Charles Manson',
                            tHealth: 100,
                            speed: 3,
                            attack: 2,
                            defense: 8,
                            duration: 10000,
                            reRouteLimit: 3
                        });
                        foe.setFaceImage('https://upload.wikimedia.org/wikipedia/commons/9/95/CharlesManson2014.jpg');

                        var args = {
                            user: this.user,
                            foes: [foe],
                            wonCallback: function() {
                                this.info = 'Please, don\'t hurt me.'
                                this.infoWindow.setContent(this.info + ' I have no idea where your children are, I just hear the guys talking in Northbridge.');
                                this.complete()
                                $('#game-action').modal('hide');
                            }.bind(this)
                        };
                        this.game.state.start('Fight', true, false, args);
                        $('#game-action').modal('show');
                    }.bind(this));

                    $('#run').on('click', function(ev) {
                        InfoWindow.closeAll();
                    });
                }
            }),
            // All poi data is contained in the place.
            new StoryStep({
                placeid: 'ChIJI0gEfSm7MioR7yWId2npZcg',
                icon: Icon.getByType('institution'),
                info: 'Finished.'
            })
        ];
    }

    PerthUnderground.prototype.getIntro = function() {
        return 'Someone kidnapped your daugther Bubitz while paying lunch. The waiter tells you that a wintess is waiting for you a few streets East.';
    };

    PerthUnderground.prototype.getTheEnd = function() {
        return 'You found her there. Lucky you that the mother didn\'t realise.';
    };

    return PerthUnderground;
});
