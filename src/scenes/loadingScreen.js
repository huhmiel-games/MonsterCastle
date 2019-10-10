import { Scene } from 'phaser';
import U from '../utils/usefull';
import tileset from '../assets/tilesets/_DungeonTilesets.png';
import tilesetN from '../assets/tilesets/_DungeonTilesets_n.png';
import sword from '../assets/spritesheets/sword_basic.png';
import knightIdle from '../assets/spritesheets/knight/knight_idle.png';
import knightRun from '../assets/spritesheets/knight/knight_run.png';
import orcIdle from '../assets/spritesheets/monsters/orc-idle.png';
import orcWalk from '../assets/spritesheets/monsters/orc-walk.png';

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
    this.load.image('tiles', [tileset, tilesetN]);
    this.load.spritesheet('sword', sword, {
      frameWidth: 21,
      frameHeight: 28,
    });
    this.load.spritesheet('knight-idle', knightIdle, {
      frameWidth: 19,
      frameHeight: 20,
    });
    this.load.spritesheet('knight-run', knightRun, {
      frameWidth: 19,
      frameHeight: 20,
    });

    this.load.spritesheet('orc-idle', orcIdle, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('orc-walk', orcWalk, {
      frameWidth: 16,
      frameHeight: 16
    });
    // this.load.spritesheet('heart', 'spritesheets/hud/spritesheetHeart.png', {
    //   frameWidth: 16,
    //   frameHeight: 16
    // });

  }

  /**
   *  Set up animations, plugins etc. that depend on the game assets we just
   *  loaded.
   */
  create() {
    //  We have nothing left to do here. Start the next scene.
    this.scene.start('LoadingAnims');
  }

  //  ------------------------------------------------------------------------
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