define(['bs', 'Util', 'Generator', 'UI', 'Foe', 'action/Base'], function($, Util, Generator, UI, Foe, ActionBase) {

    ActionExtort.prototype = Object.create(ActionBase.prototype);

    function ActionExtort(user, game, marker, poiData) {
        ActionBase.call(this, user, game, marker, poiData);
        return this;
    }

    ActionExtort.prototype.tax = null;

    ActionExtort.prototype.getVisibleName = function() {
        return 'Extort them';
    }

    ActionExtort.prototype.render = function() {

        // Renderer promise.
        var rendererPromise = $.Deferred();

        // Get the header.
        var headerPromise = this.printHeader();

        this.tax = Generator.poiExtortionTax(this.poiData);

        var text;
        if (this.user.canIntimidate(this.poiData)) {
            // They are intimidated and they will pay.
            text = this.getIntimidatedText();
            this.extorted();
        } else {
            // You are not strong enough, they are not scared of you.

            text = '<p>Who do you think you are?? Leave before we smash you.</p>' +
                UI.renderActionButtons([
                    {
                        id: 'fight',
                        text: 'Fight them'
                    }, {
                        id: 'cancel',
                        text: 'Leave'
                    }
                ]);
        }

        // Once we have the header we concat the body and resolve the renderer promise.
        headerPromise.done(function(html) {
            html = html + '<div id="extort-info" class="info-box">' + text + '</div>';
            rendererPromise.resolve(html);
        }.bind(this));

        return rendererPromise;
    };

    ActionExtort.prototype.rendered = function() {

        $('#fight').on('click', function(ev) {

            var foe = new Foe({
                name: this.poiData.name,
                tHealth: 100,
                speed: 3,
                attack: 2,
                defense: 8,
                duration: 10000,
                reRouteLimit: 3
            });
            foe.setFaceImage(this.shopKeeperImage);

            var args = {
                user: this.user,
                foes: [foe],
                wonCallback: function() {
                    $('#extort-info').html(this.getIntimidatedText());
                    this.extorted();
                    $('#game-action').modal('hide');
                }.bind(this)
            };
            this.game.state.start('Fight', true, false, args);
            $('#game-action').modal('show');

        }.bind(this));

        $('#cancel').on('click', function(ev) {
            this.closeAction(ev);
        }.bind(this));

    };

    ActionExtort.prototype.getIntimidatedText = function() {
        return '<p>Please, don\'t hurt us. We will regularly pay you a $' + this.tax + ' tax.</p>';
    };

    ActionExtort.prototype.extorted = function() {
        this.markAsDone();
        this.user.addExtortion({
            poiData: this.poiData,
            marker: this.marker,
            amount: this.tax
        });
    };

    return ActionExtort;
});
