define(function() {

    function HealthBar(game, xPosition, yPosition, barWidth, barHeight) {

        this.game = game;

        // We need this later to convert life percentages to width in pixels.
        this.barWidthMultiplier = barWidth / 100;

        var bmd = this.game.add.bitmapData(barWidth, barHeight);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, barWidth, barHeight);
            bmd.ctx.fillStyle = '#e40613';
            bmd.ctx.fill();
        this.bglife = this.game.add.sprite(xPosition, yPosition, bmd);

        var lifeSize = Math.round(barWidth);
        bmd = this.game.add.bitmapData(lifeSize, barHeight);
        bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, barWidth, barHeight);
            bmd.ctx.fillStyle = '#FEFF03';
            bmd.ctx.fill();

        this.widthLife = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);

        this.life = this.game.add.sprite(xPosition, yPosition, bmd);
        this.life.cropEnabled = true;
        this.life.crop(this.widthLife);
    }

    HealthBar.prototype = {

        game: null,

        widthLife: null,

        barWidthMultiplier: null,

        bglife: null,
        life: null,

        updateHealth: function(percent) {
            if (percent < 0) {
                percent = 0;
            } else if (percent > 100) {
                percent = 100;
            } else {
                percent = Math.round(percent);
            }

            var width = percent * this.barWidthMultiplier;
            this.game.add.tween(this.widthLife).to( { width: width }, 200, Phaser.Easing.Linear.None, true);
        },

        update: function() {
            this.life.updateCrop();
        },
    };

    return HealthBar;
});
