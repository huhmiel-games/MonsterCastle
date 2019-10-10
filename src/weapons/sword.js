export default class Sword extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setDepth(11);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // this.lifespan -= delta;
    // if (this.lifespan <= 0) {
    //   this.destroy();
    // }
  }

  sheathe(player) {
    this.anims.stop();
    this.setFrame(0);
    if (player.facing === 'right') {
      
      this.x = player.x - 12;
      this.y = player.y - 2;
      this.angle = 0;
      //this.body.setSize(5, 20);
      this.setFlipX(true);
    }
    else {
      
      this.x = player.x + 12;
      this.y = player.y - 2;
      this.angle = 0;
      //this.body.setSize(5, 20);
      this.setFlipX(false);
    }
    //console.log(this)
  }

  attack() {
    const { x, y } = this.scene.player;
    //this.setAngle(this.scene.player.angle);
    // this.body.width = frameWidth;
    // this.body.height = frameHeight;
    //this.lifespan = lifespan;

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

  killSword() {
    if (this.active) {
      this.body.setVelocity(0, 0);
      // const impact = this.scene.impactGroup.getFirstDead(true, this.x, this.y, 'impact', null, true);
      // impact.setActive(true);
      // impact.setVisible(true);
      // this.scene.sound.play('explo', { volume: 0.08, rate: (1 / this.frame.width) * 10 });
      // const str = this.name.substr(-1);
      // this.scene.lights.lights[+str + 1].x = -100;
      // this.scene.lights.lights[+str + 1].y = -100;
      // this.destroy();
      // impact.anims.play('impact', true);
      // impact.on('animationcomplete', () => {
      //   impact.setActive(false);
      //   impact.setVisible(false);
      //   impact.setPosition(-100, -100);
      // });
    }
  }
}
