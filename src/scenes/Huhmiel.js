import { Scene } from 'phaser';
import U from '../utils/usefull';
import atomicsc from '../assets/atomicsc.png';
import atomicscXML from '../assets/atomicsc.xml';
import bgLoadingScreen from '../assets/splash-screen.png';
import progressBar from '../assets/progress-bar.png';

export default class Huhmiel extends Scene {
  constructor() {
    super('huhmiel');
  }

  init() {
    // --> FULLSCREEN MODE
    // const startBtn = document.getElementById('fullscreen');
    // startBtn.addEventListener('click', () => {
    //   if (!this.scale.isFullscreen) {
    //     this.scale.startFullscreen();
    //   }
    // });
    document.onfullscreenchange = () => {
      if (document.fullscreenElement === null) {
        this.scale.stopFullscreen();
      }
    };
  }

  preload() {
    this.load.bitmapFont('atomic', atomicsc, atomicscXML);
    this.load.image('bgLoadingScreen', bgLoadingScreen);
    this.load.image('progressBar', progressBar);
  }

  create() {
    this.huhmiel = this.add.bitmapText(U.WIDTH / 2, U.HEIGHT / 2, 'atomic', 'huhmiel games', 30, 1)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this.tween = this.tweens.add({
      targets: this.huhmiel,
      ease: 'Sine.easeInOut',
      duration: 2000,
      delay: 1000,
      repeat: 0,
      yoyo: true,
      alpha: {
        getStart: () => 0,
        getEnd: () => 1,
      },
      onComplete: () => {
        this.scene.start('LoadingScreen');
      },
    });

    this.input.keyboard.once('keydown', () => {
      this.tween.stop();
      this.scene.start('LoadingScreen');
    });
  }
}
