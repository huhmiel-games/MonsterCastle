import Phaser from 'phaser';
import U from './utils/usefull';
import Huhmiel from './scenes/Huhmiel';
import LoadingScreen from './scenes/loadingScreen';
import DungeonScene from './scenes/dungeonScene';
import End from './scenes/end';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: U.WIDTH,
  height: U.HEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'gamecanvas',
  },
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
  scene: [Huhmiel, LoadingScreen, DungeonScene, End],
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
