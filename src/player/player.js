// import Weapon from '../weapons/weapon';

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame('knightIdle0');
    this.moving = false;
    this.attacking = false;
    this.facing = 'right';
    this.life = 6;
    this.getHit = false;
    this.playerRoom;
    this.keys = this.scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes['LEFT'],
      leftA: Phaser.Input.Keyboard.KeyCodes['A'],
      right: Phaser.Input.Keyboard.KeyCodes['RIGHT'],
      rightD: Phaser.Input.Keyboard.KeyCodes['D'],
      up: Phaser.Input.Keyboard.KeyCodes['UP'],
      upW: Phaser.Input.Keyboard.KeyCodes['W'],
      down: Phaser.Input.Keyboard.KeyCodes['DOWN'],
      downS: Phaser.Input.Keyboard.KeyCodes['S'],
      fire: Phaser.Input.Keyboard.KeyCodes['X'],
      fireK: Phaser.Input.Keyboard.KeyCodes['K'],
      fullscreen: Phaser.Input.Keyboard.KeyCodes['F'],
      pause: Phaser.Input.Keyboard.KeyCodes['P'],
    });
    this.body.setSize(11, 11, 8);
    this.weaponFacing = 'right';
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const keys = this.keys;

    if (keys.fire.isDown || keys.fireK.isDown) {
      this.attacking = true;
      this.scene.sword.attack();
    } else {
      this.attacking = false;
      this.scene.sword.sheathe(this);
    }

    if(keys.left.isDown || keys.leftA.isDown) {
      this.facing = 'left';
      this.weaponFacing = 'left';
      this.body.setVelocityX(-100);
      this.setFlip(true);
    } else if (keys.right.isDown || keys.rightD.isDown){
      this.facing = 'right';
      this.weaponFacing = 'right';
      this.body.setVelocityX(100);
      this.setFlip(false);
    } else {
      this.body.setVelocityX(0);
    }
    if(keys.up.isDown || keys.upW.isDown) {
      this.weaponFacing = 'top';
      this.body.setVelocityY(-100);
    } else if(keys.down.isDown || keys.downS.isDown) {
      this.weaponFacing = 'bottom';
      this.body.setVelocityY(100);
    } else {
      this.body.setVelocityY(0);
    }

    this.body.velocity.normalize().scale(100);

    if(
      keys.left.isDown || keys.leftA.isDown
      || keys.right.isDown || keys.rightD.isDown
      || keys.down.isDown || keys.downS.isDown
      || keys.up.isDown || keys.upW.isDown
    ) {
      this.moving = true;
      this.anims.play('playerRun', true);
    } else if (this.moving) {
      this.moving = false;
      this.anims.play('playerIdle', true);
      this.body.setVelocity(0);
    }

    if (keys.fullscreen.isDown) {
      this.setFullscreen();
    }
  }

  setFullscreen() {
    this.scene.scale.toggleFullscreen();
  }

  freeze(bool) {
    if (bool) {
      this.body.moves = false;
    } else {
      this.body.moves = true;
    }
  }

  getDamage() {
    if (this.getHit) {
      return;
    }
    this.setTint(0xFF0000);
    this.getHit = true;
    this.life -= 1;
    this.scene.handleHudHeart(this.life);
    this.scene.time.addEvent({
      delay: 300,
      callback: () => {
        this.getHit = false;
        this.clearTint();
      }
    });

    if (this.life <= 0) {
      this.gameOver();
      return;
    } else {
      this.scene.events.emit('setHealth', { life: this.life });
    }
  }

  gameOver() {
    const particlesQuantity = 64;
    // particles explosion config
    this.scene.particles = null;
    this.scene.particles = this.scene.add.particles('transparentPixel');
    this.scene.emitter = this.scene.particles.createEmitter({
      angle: { min: -30, max: -150 },
      speed: { min: 50, max: 200 },
      quantity: { min: particlesQuantity, max: particlesQuantity },
      lifespan: { min: 500, max: 1000 },
      tint: 0x72D6CE,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 6 },
      gravityY: 300,
      on: false,
    });
    // particles explosion start
    this.scene.particles.emitParticleAt(this.x,this.y);

    // Game Over text
    const gameOverText = this.scene.add
      .bitmapText(this.scene.cameras.main.midPoint.x , this.scene.cameras.main.midPoint.y, 'atomic', `Game Over`, 20, 1)
      .setOrigin(0.5, 0.5)
      .setDepth(50)
      .setAlpha(0)
      .setTint(0xFF0000);
    this.tween = this.scene.tweens.add({
      targets: gameOverText,
      duration: 2000,
      delay: 300,
      repeat: 0,
      alpha: {
        getStart: () => 0,
        getEnd: () => 1,
      },
    });

    this.scene.sword.destroy();
    this.scene.restartNewGame();
    this.destroy();
  }
}
