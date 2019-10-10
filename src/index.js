import Phaser from 'phaser';
import U from './utils/usefull';
import Huhmiel from './scenes/Huhmiel';
import LoadingScreen from './scenes/loadingScreen';
import LoadingAnims from './scenes/loadingAnims';
import DungeonScene from './scenes/dungeonScene';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: U.WIDTH,
  height: U.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      tileBias: 20,
      gravity: { y: 0 },
      debug: true,
      debugShowBody: true,
      debugShowStaticBody: true,
    },
  },
  scene: [Huhmiel, LoadingScreen, LoadingAnims, DungeonScene],
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
