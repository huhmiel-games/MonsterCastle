import { Scene } from 'phaser';

export default class LoadingAnims extends Scene {
  constructor() {
    super({ key: 'LoadingAnims' });
  }

  create() {
    //  Create all anims here 
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('knight-idle', {start: 0, end: 19}),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'player-run',
      frames: this.anims.generateFrameNumbers('knight-run', {start: 0, end: 3}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'orcIdle',
      frames: this.anims.generateFrameNumbers('orc-idle', {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'orcWalk',
      frames: this.anims.generateFrameNumbers('orc-walk', {start: 0, end: 3}),
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'attackSword',
      frames: this.anims.generateFrameNumbers('sword', {start: 0, end: 3, first: 3}),
      frameRate: 12,
      repeat: 0,
      yoyo: true,
    });

    // all anims created, launch next scene
    this.scene.start('DungeonScene');
  }  
}