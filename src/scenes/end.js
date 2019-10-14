import { Scene } from 'phaser';
import U from '../utils/usefull';

export default class End extends Scene {
  constructor() {
    super('End');
  }

  create() {
    // this.mainScene = this.scene.get('playLvl1');
    
    this.cnt = 0;
    this.transDisplay = this.add.bitmapText(U.WIDTH / 2, U.HEIGHT / 2, 'atomic', 'Congratulations !!!', 20, 1)
      .setOrigin(0.5, 0.5);

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.twe = this.tweens.add({
          targets: [this.transDisplay],
          ease: 'Sine.easeInOut',
          duration: 2000,
          delay: 1000,
          repeat: 0,
          yoyo: false,
          alpha: {
            getStart: () => 1,
            getEnd: () => 0,
          },
        });
      },
    });

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.tweene = this.tweens.add({
          targets: this.congrat,
          ease: 'Sine.easeInOut',
          duration: 2000,
          delay: 0,
          repeat: 0,
          yoyo: false,
          alpha: {
            getStart: () => 1,
            getEnd: () => 0,
          },
          onComplete: () => {
            this.credits();
          },
        });
      },
    });
    this.cameras.main.fadeIn(2500);
  }

  credits() {
    this.trans = 'Credits---Designer:-Philippe Pereira---Graphics:-Robert 0x72-Reichsburg Cochem---Programming:-Philippe Pereira-Allan Cerveaux---Game Engine:-Phaser 3---Sound Programming:-Philippe Pereira---Music:-ArcOfDream--- -- -- -- -- -- -- -- --Thanks for playing-- -- -- -- -- -- -- -- -- -- --THE END-- -- -- -- -- -- -- -- --';
    this.cnt = 0;
    this.transDisplay = this.add.bitmapText(U.WIDTH / 2, U.HEIGHT / 2, 'atomic', '', 20, 1)
      .setOrigin(0.5, 0.8)
      .setAlpha(1);

    this.time.addEvent({
      delay: 80,
      repeat: this.trans.length - 1,
      callback: () => {
        if (this.trans[this.cnt] === '-') {
          this.transDisplay.text += '\n';
          this.cnt += 1;
        } else {
          this.transDisplay.text += this.trans[this.cnt];
          this.cnt += 1;
        }
      },
    });
  }
}
