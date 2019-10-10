// import Weapon from '../weapons/weapon';

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame(0);
    
    this.moving = false;
    this.attacking = false;
    this.facing = 'right';
    this.life = 6;
    this.getHit = false;
    this.keys = scene.input.keyboard.createCursorKeys();
    this.body.setSize(12, 12, 8);
    this.weaponFacing = 'right';
    this.lastFired = 0;
    this.fireRate = 420;
  }

  freeze() {
    this.body.moves = false;
  }

  getActiveWeapon() {
    return this.activeWeapon;
  }

  setActiveWeapon(weapon) {
    this.activeWeapon = weapon;
  }

  getDamage() {
    if (this.getHit) {
      return;
    }
    this.setTintFill(0xFF0000);
    this.getHit = true;
    this.life -= 1;
    //this.scene.handleHudHeart(this.life);
    this.scene.time.addEvent({
      delay: 300,
      callback: () => {
        this.getHit = false;
        this.clearTint();
      }
    });

    if (this.life <= 0) {
      console.log('PLAYER IS DEAD, LAUNCH SCENE GAME OVER');
      this.scene.level = 0;
    } else {
      this.scene.events.emit('setHealth', { life: this.life });
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const keys = this.keys;
    const speed = 100;

    this.body.setVelocity(0);

    if(keys.left.isDown) {
      this.facing = 'left';
      this.weaponFacing = 'left';
      this.body.setVelocityX(-speed);
      this.setFlip(true);
    } else if (keys.right.isDown){
      this.facing = 'right';
      this.weaponFacing = 'right';
      this.body.setVelocityX(speed);
      this.setFlip(false);
    }

    if(keys.up.isDown) {
      this.weaponFacing = 'top';
      this.body.setVelocityY(-speed);
    } else if(keys.down.isDown) {
      this.weaponFacing = 'bottom';
      this.body.setVelocityY(speed);
    }

    this.body.velocity.normalize().scale(speed);

    if(keys.left.isDown || keys.right.isDown || keys.down.isDown || keys.up.isDown) {
      this.moving = true;
      this.anims.play('player-run', true);
    } else if (this.moving) {
      this.moving = false;
      this.anims.play('player-idle', true);
    }

    if (keys.space.isDown) {
      this.attacking = true;
      this.scene.sword.attack(time);
    } else {
      this.attacking = false;
      this.scene.sword.sheathe(this);
    }
  }

  // attack(time) {
  //   if (time > this.lastFired) {
  //     const sword = this.scene.swordGroup.getFirstDead(
  //       true,
  //       this.body.x + this.body.halfWidth,
  //       this.body.y + this.body.halfHeight,
  //       'sword',
  //       null,
  //       true,
  //     );

  //     if (sword) {
  //       this.lastFired = time + this.fireRate;
  //       sword.setTexture('sword');
  //       this.swordDamage = sword.frame.width * sword.frame.height;
  //       sword.setDepth(99);
  //       sword.attack(sword.frame.width, sword.frame.height);
  //       // this.scene.sound.play('laser', { volume: 0.05, rate: (1 / sword[i].frame.width) * 10 });
  //     }
      
  //   }
  // }
  

  // swordKill(e) {
  //   // if (this.bulletBounce && e.lifespan > 0) {
  //   //   return;
  //   // }
  //   console.log(e)
  //   e.killSword(e);
  // }
}
