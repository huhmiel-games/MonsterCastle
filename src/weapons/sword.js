export default class Sword extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame(config.frame);
    this.setDepth(11);
    this.soundAttackIsPlaying = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }

  sheathe(player) {    
    if (player.facing === 'right') {
      this.x = player.x - 12;
      this.y = player.y - 2;
      this.angle = 0;
      this.setFlipX(true);
    }
    else {
      this.x = player.x + 12;
      this.y = player.y - 2;
      this.angle = 0;
      this.setFlipX(false);
    }
    if (!this.anims.isPlaying) {
      return;
    }
    this.anims.stop();
    this.setFrame('sword0');
  }

  attack() {
    const { x, y } = this.scene.player;
    this.soundAttackPlay();
    switch (this.scene.player.weaponFacing) {
    case 'right':
      this.x = x + 13;
      this.y = y;
      this.angle = 90;
      this.body.setSize(20, 5);
      this.setFlipX(true);
      break;
    case 'left':
      this.x = x - 13;
      this.y = y ;
      this.angle = 270;
      this.body.setSize(20, 5);
      this.setFlipX(false);
      break;
    case 'top':
      this.x = x;
      this.y = y - 13;
      this.angle = 0;
      this.body.setSize(5, 20);
      this.setFlipX(false);
      break;
    case 'bottom':
      this.x = x;
      this.y = y + 13;
      this.angle = 180;
      this.body.setSize(5, 20);
      break;
    default:
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.angle = 180;
    }
    this.anims.play('attackSword', true);
  }

  soundAttackPlay() {
    if (this.soundAttackIsPlaying) {
      return;
    }
    this.soundAttackIsPlaying = true;
    this.scene.fx = this.scene.sound.add('swordFx');
    this.scene.fx.play();
    this.scene.fx.once('complete', () => {
      this.soundAttackIsPlaying = false;
      if (this.scene) {
        this.scene.fx.destroy();
      }
    });
  }
}
