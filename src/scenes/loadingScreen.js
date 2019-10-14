import { Scene } from 'phaser';
import U from '../utils/usefull';
import tileset from '../assets/tilesets/_DungeonTilesets2.png';
import tilesetN from '../assets/tilesets/_DungeonTilesets2_n.png';
import transparentPixel from '../assets/transparentPixel.png';
import ExMachina from '../assets/music/ExMachina.ogg';
import swordFx from '../assets/sounds/swordFx.ogg';
import explodeFx from '../assets/sounds/explodeFx.ogg';
import getLifeFx from '../assets/sounds/getLifeFx.ogg';
import gameOverFx from '../assets/sounds/gameOver.ogg';
import enemyExplodeFx from '../assets/sounds/enemyExplodeFx.ogg';
import atlasObjects from '../assets/atlas/atlas.png';
import atlasObjectsN from '../assets/atlas/atlas_n.png';
import atlasObjectsJSON from '../assets/atlas/atlas.json';

export default class LoadingScreen extends Scene {
  constructor() {
    super({
      key: 'LoadingScreen',

      //  Splash screen and progress bar textures.
      pack: {
        files: [{
          key: 'bgLoadingScreen',
          type: 'image'
        }, {
          key: 'progressBar',
          type: 'image'
        }]
      }
    });
  }

  preload() {
    //  Display cover and progress bar textures.
    this.showCover();
    this.showProgressBar();
    
    // Load all assets here
    this.load.audio('ExMachina', ExMachina);
    this.load.audio('swordFx', swordFx);
    this.load.audio('explodeFx', explodeFx);
    this.load.audio('getLifeFx', getLifeFx);
    this.load.audio('gameOverFx', gameOverFx);
    this.load.audio('enemyExplodeFx', enemyExplodeFx);

    this.load.atlas('atlas', [atlasObjects, atlasObjectsN], atlasObjectsJSON);
    this.load.image('tiles', [tileset, tilesetN]);
    this.load.image('transparentPixel', transparentPixel);
  }

  create() {
    //  Create all anims here 
    this.anims.create({
      key: 'playerIdle',
      frames: [
        { key: 'atlas', frame: 'knightIdle0' },
        { key: 'atlas', frame: 'knightIdle1' },
        { key: 'atlas', frame: 'knightIdle2' },
        { key: 'atlas', frame: 'knightIdle3' },
      ],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'playerRun',
      frames: [
        { key: 'atlas', frame: 'knightRun0' },
        { key: 'atlas', frame: 'knightRun1' },
        { key: 'atlas', frame: 'knightRun2' },
        { key: 'atlas', frame: 'knightRun3' },
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'orcIdle',
      frames: [
        { key: 'atlas', frame: 'orcIdle0' },
        { key: 'atlas', frame: 'orcIdle1' },
        { key: 'atlas', frame: 'orcIdle2' },
        { key: 'atlas', frame: 'orcIdle3' },
      ],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'orcWalk',
      frames: [
        { key: 'atlas', frame: 'orcWalk0' },
        { key: 'atlas', frame: 'orcWalk1' },
        { key: 'atlas', frame: 'orcWalk2' },
        { key: 'atlas', frame: 'orcWalk3' },
      ],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'bossIdle',
      frames: [
        { key: 'atlas', frame: 'boss0' },
        { key: 'atlas', frame: 'boss1' },
        { key: 'atlas', frame: 'boss2' },
        { key: 'atlas', frame: 'boss3' },
      ],
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'bossAttack',
      frames: [
        { key: 'atlas', frame: 'boss4' },
        { key: 'atlas', frame: 'boss5' },
        { key: 'atlas', frame: 'boss6' },
        { key: 'atlas', frame: 'boss7' },
      ],
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'attackSword',
      frames: [
        { key: 'atlas', frame: 'sword0' },
        { key: 'atlas', frame: 'sword1' },
        { key: 'atlas', frame: 'sword2' },
        { key: 'atlas', frame: 'sword3' },
      ],
      frameRate: 12,
      repeat: 0,
      yoyo: true,
    });

    this.startText = this.add.bitmapText(this.cameras.main.scrollX + 240, this.cameras.main.scrollY + 280, 'atomic')
      .setFontSize(25)
      .setText('Press X to start')
      .setOrigin(0.5, 0.5)
      .setTint(0xDA4E38)
      .setDepth(100);
    
    this.infoText = this.add.bitmapText(this.cameras.main.scrollX + 240, this.cameras.main.scrollY + 304, 'atomic')
      .setFontSize(10)
      .setText('Use X or K to attack   Use Cursors or WASD to move')
      .setOrigin(0.5, 0.5)
      .setDepth(100);

    this.tween = this.tweens.add({
      targets: this.startText,
      ease: 'Sine.easeInOut',
      duration: 1500,
      delay: 0,
      repeat: -1,
      yoyo: true,
      alpha: {
        getStart: () => 0.05,
        getEnd: () => 1,
      },
    });
    this.input.keyboard.once('keydown', () => {
      this.tween.stop();
      this.scene.start('DungeonScene');
    });
    
  }

  showCover() {
    this.add.image(0, 0, 'bgLoadingScreen').setOrigin(0).setSize(U.WIDTH, U.HEIGHT);
  }

  showProgressBar() {
    //  Get the progress bar filler texture dimensions.
    const {width: w, height: h} = this.textures.get('progressBar').get();

    //  Place the filler over the progress bar of the splash screen.
    const img = this.add.sprite(U.WIDTH / 4, U.HEIGHT / 4 * 3, 'progressBar').setOrigin(0);

    // Add percentage text
    const loadingpercentage = this.add.bitmapText(U.WIDTH / 2, U.HEIGHT / 4 * 3 - 10, 'atomic', 'Loading:', 10, 1)
      .setOrigin(0.5, 0.5)
      .setAlpha(1);

    //  Crop the filler along its width, proportional to the amount of files loaded.
    this.load.on('progress', (v) => {
      loadingpercentage.text = `Loading: ${Math.round(v * 100)}%`;
      img.setCrop(0, 0, Math.ceil(v * w), h);
    });
  }
}