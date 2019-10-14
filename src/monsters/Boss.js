export default class Boss extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene = scene;
    this.level = config.lvl;
    this.lastAnim = null;
    this.alpha = 0;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame(config.frame);
    this.anims.play('bossIdle', true);
    this.body.setSize(25, 25);
    this.soundDieIsPlaying = false;
    this.setPipeline('Light2D');
    this.attacking = true;
    this.timerBoss = null;
    this.sleep(7000);
    this.life = 6;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.active) {
      let animationName;
      const player = this.scene.player;
      if (!this.attacking) {
        this.body.setVelocity(0, 0);
        this.anims.stop();
        this.setFrame('boss3');
        return;
      }
      
      const targetAngle = Phaser.Math.Angle.Between(
        this.x, this.y,
        player.x, player.y,
      );
      this.body.velocity.x = Math.cos(targetAngle) * (60);
      this.body.velocity.y = Math.sin(targetAngle) * (60);
      animationName = 'bossAttack';
      
      this.body.velocity.x >= 0 ? this.setFlipX(false) : this.setFlipX(true);

      if (this.lastAnim !== animationName) {
        this.lastAnim = animationName;
        this.animate(animationName, true);
      }
    }
  }

  animate(str) {
    this.anims.play(str, true);
  }

  freeze(bool) {
    if (bool) {
      this.body.moves = false;
    } else {
      this.body.moves = true;
    }
  }

  sleep(maxNbr) {
    const value = Phaser.Math.Between(1000, maxNbr);
    this.bossTimer = this.scene.time.addEvent({
      delay: value,
      loop: false, 
      callback: () => {
        if (this.attacking) {
          this.attacking = false;
          this.sleep(3000);
        } else {
          this.attacking = true;
          this.sleep(7000);
          this.anims.play('bossAttack');
        }
      }
    });
  }

  die() {
    this.bossTimer.remove();
    this.soundDiePlay();
    const particlesQuantity = this.width * 12;
    // particles explosion config
    this.scene.particles = null;
    this.scene.particles = this.scene.add.particles('transparentPixel');
    this.scene.emitter = this.scene.particles.createEmitter({
      angle: { min: -10, max: -170 },
      speed: { min: 50, max: 400 },
      quantity: { min: particlesQuantity, max: particlesQuantity },
      lifespan: { min: 500, max: 2000 },
      tint: 0xFB4E20,
      alpha: { start: 1, end: 0 },
      scale: { start: 3, end: 6 },
      gravityY: 300,
      on: false,
    });
    // particles explosion start
    this.scene.particles.emitParticleAt(this.x, this.y);
    // disable boss
    this.active = false;
    this.alpha = 0;
    this.body.enable = false;

    const ground = this.scene.groundLayer.getTileAtWorldXY(this.x, this.y);

    this.scene.groundLayer.putTileAt(26, ground.x, ground.y, false);
    this.scene.groundLayer.setTileLocationCallback(ground.x, ground.y, 1, 1, () => {
      this.TheEnd(ground.x, ground.y);
    }, this);
  }

  TheEnd(groundx, groundy) {
    this.scene.player.freeze(true);
    this.scene.player.setPosition(groundx * 16 + 8, groundy * 16 + 8);
    this.scene.sword.setAlpha(0);
    this.scene.groundLayer.setTileLocationCallback(groundx, groundy, 2, 2, null);
    this.scene.lightTween.pause();
    this.lightTween = this.scene.tweens.add({
      targets: this.scene.lightPoint,
      ease: 'Sine.easeInOut',
      delay: 0,
      duration: 1600,
      radius: {
        getStart: () => 65,
        getEnd: () => 0,
      }
    });
    this.tween = this.scene.tweens.add({
      targets: [this.scene.player, this.scene.lightPoint],
      ease: 'Sine.easeInOut',
      delay: 0,
      duration: 1500,
      scale: {
        getStart: () => 1,
        getEnd: () => 0,
      },
      angle:  {
        getStart: () => 0,
        getEnd: () => - 720,
      },
      onComplete: () => {
        this.scene.cameras.main.fadeOut(6000);
        this.scene.theEnd = true;
        this.scene.startEndGame();
      },
    });
  }

  getDamage() {
    if (this.attacking || this.getHit) {
      !this.getHit ? this.scene.soundObjectExplode() : null;
      return;
    }
    this.getHit = true;
    this.life -= 1;
    if (this.life <= 0) {
      this.die();
      return;
    }
    this.setTint(0xE6FB20);
    this.setFrame('boss0');
    this.scene.time.addEvent({
      delay: 1000,
      loop: false, 
      callback: () => {
        this.clearTint();
        this.getHit = false;
      }
    });
    this.soundDiePlay();
    const particlesQuantity = this.width * 4;
    // particles explosion config
    this.scene.particles = null;
    this.scene.particles = this.scene.add.particles('transparentPixel');
    this.scene.emitter = this.scene.particles.createEmitter({
      angle: { min: -30, max: -150 },
      speed: { min: 50, max: 200 },
      quantity: { min: particlesQuantity, max: particlesQuantity },
      lifespan: { min: 500, max: 1000 },
      tint: 0xFB4E20,
      alpha: { start: 1, end: 0 },
      scale: { start: 3, end: 1 },
      gravityY: 300,
      on: false,
    });
    // particles explosion start
    this.scene.particles.emitParticleAt(this.x, this.y);

  }

  soundDiePlay() {
    if (this.soundDieIsPlaying) {
      return;
    }
    this.soundDieIsPlaying = true;
    this.scene.enemyDieFx = this.scene.sound.add('enemyExplodeFx');
    this.scene.enemyDieFx.play();
    this.scene.enemyDieFx.once('complete', () => {
      this.soundDieIsPlaying = false;
      if (this.scene) {
        this.scene.enemyDieFx.destroy();
      }
    });
  }
}