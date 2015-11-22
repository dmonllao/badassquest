define(['jquery', 'Const'], function($, Const) {

    // Sprite hardcoded values.
    var bodyScale = 2;
    var headScale = 1;

    function Foe(attrs) {

        this.id = this.generateId();
        this.attrs = attrs;

        // We want them all defined.
        for (var attr in this.attrs) {
            if (this.attrs.hasOwnProperty(attr)) {
                if (this.attrs[attr] === null) {
                    console.error('Missing ' + attr + ' foe attribute');
                    this.attrs[attr] = 1;
                }
            }
        }

        // Weirdest thing I've seen in last months. I just give up. If I remove this {} assign
        // looks like this.state is shared accross all Foe instances...
        this.state = {};
        this.state['cHealth'] = this.attrs.tHealth;

        // Default one.
        this.image = this.setFaceImage('img/mushroom2.png');
        return this;
    }

    Foe.prototype = {
        id: null,
        attrs: {
            name: null,
            tHealth: null,
            speed: null,
            attack: null,
            defense: null
        },
        state: {},
        image: null,

        user: null,

        bounceCounter: 0,

        spriteData: {},

        generateId: function() {
            return Math.floor(Math.random() * 1000) * Math.floor(Date.now() / 1000);
        },

        isDead: function() {
            if (this.state.cHealth <= 0) {
                return true;
            }
            return false;
        },

        setFaceImage: function(imageUrl) {
            this.image = imageUrl;
        },

        setUser: function(user) {
            this.user = user;
        },

        attackTurn: function(game, callback) {
            setTimeout(function() {
                // Hurt the user.
                this.user.updateState({
                    cHealth: this.user.state.cHealth - this.attrs.attack
                })
                callback();
            }.bind(this), Const.foeAttackTime);
        },

        preloadAssets: function(game) {
            game.load.image('face' + this.id, this.image);

            // TODO This should be an foe constructor attribute.
            // Include the foe id as it should be unique.
            game.load.spritesheet('body' + this.id, 'img/foe1_f_40_30.png', 40, 30, 2);
        },

        createSprite: function(game, x, y) {

            this.spriteData.sprite = game.add.sprite(x, y);

            // Body and legs scaled at half size and head size doubled.
            this.spriteData.body = this.spriteData.sprite.addChild(game.make.sprite(0, 0, 'body' + this.id));
            this.spriteData.body.scale.setTo(bodyScale, bodyScale);

            var animation = this.spriteData.body.animations.add('skizo');
            animation.play(10, true);

            // Divided by 2 to position it at half body, will be adjusted later decreasing it by half head width.
            this.spriteData.head = this.spriteData.sprite.addChild(game.make.sprite(
                this.spriteData.body.getBounds().width * bodyScale / 2,
                0,
                'face' + this.id
            ));
            this.spriteData.head.scale.setTo(headScale, headScale);

            // Head should consider its own width.
            this.spriteData.head.x = this.spriteData.head.x - (this.spriteData.head.getBounds().width * headScale) / 2;

            // Set the head above the body.
            this.spriteData.head.y = this.spriteData.head.y - (this.spriteData.head.getBounds().height * headScale);

            // Bouncing foes test.
            game.physics.enable(this.spriteData.sprite, Phaser.Physics.ARCADE);
            //  This gets it moving
            this.spriteData.sprite.body.velocity.setTo(200, 200);
            //  This makes the game world bounce-able
            this.spriteData.sprite.body.collideWorldBounds = true;
            //  This sets the image bounce energy for the horizontal and vertical vectors
            // (as an x,y point). "1" is 100% energy return
            this.spriteData.sprite.body.bounce.set(0.8);
            this.spriteData.sprite.body.gravity.set(0, 180);

            return this.spriteData.sprite;
        },

        updateCanvas: function(game) {

            if (this.isDead()) {
                return;
            }

            // Check that the spriteData is available.
            if (this.spriteData.sprite.body) {

                // Bounce again if the sprite is on the floor.
                if (this.spriteData.sprite.y > game.world.width - this.spriteData.sprite.height) {
                    this.bounceCounter++;
                }

                // If the foe has been on the floor for 10 updates means that it is fixed there.
                if (this.bounceCounter !== 0 && this.bounceCounter % 10 === 0) {
                    this.spriteData.sprite.body.velocity.setTo(200, 200);
                }
            }

        }
    };

    return Foe;
});
