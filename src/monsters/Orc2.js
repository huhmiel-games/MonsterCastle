export default class Orc2 extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene = scene;
    this.level = config.lvl;
    this.lastAnim = null;
    this.alpha = 0;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.anims.play('orcIdle', true);
    this.body.setSize(10, 10);
    this.soundDieIsPlaying = false;
    this.setPipeline('Light2D');
    const orcTileX = this.scene.groundLayer.worldToTileX(this.x);
    const orcTileY = this.scene.groundLayer.worldToTileY(this.y);
    this.orcRoom = this.scene.dungeon.getRoomAt(orcTileX, orcTileY);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.active) {
      let animationName;
      const player = this.scene.player;
      if (this.orcRoom !== player.playerRoom) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        animationName = 'orcIdle';
        return;
      }
      if (Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) <= 60) {
        const targetAngle = Phaser.Math.Angle.Between(
          this.x, this.y,
          player.x, player.y,
        );
        this.body.velocity.x = Math.cos(targetAngle) * (30 + this.level);
        this.body.velocity.y = Math.sin(targetAngle) * (30 + this.level);
        animationName = 'orcWalk';
      } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        animationName = 'orcIdle';
      }

      if (this.lastAnim !== animationName) {
        this.lastAnim = animationName;
        this.animate(animationName, true);
      }
    }
  }

  animate(str) {
    this.anims.play(str, true);
  }

  die() {
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
      tint: 0x3C704D,
      alpha: { start: 1, end: 0 },
      scale: { start: 3, end: 1 },
      gravityY: 300,
      on: false,
    });
    // particles explosion start
    this.scene.particles.emitParticleAt(this.x, this.y);
    this.destroy();
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