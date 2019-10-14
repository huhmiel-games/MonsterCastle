import { Scene } from 'phaser';
import Dungeon from '@mikewesthad/dungeon';
import Player from '../player/player';
import Sword from '../weapons/sword';
import TILES from '../plugins/tiles-mapping';
import TilemapVisibility from '../plugins/tilemap-visibility';
import LevelGenerator from '../plugins/level-generator';
import Orc2 from '../monsters/Orc2';
import Boss from '../monsters/Boss';

export default class DungeonScene extends Scene {
  constructor() {
    super({key: 'DungeonScene'});
    this.level = 0;
    this.gameOver = false;
    this.soundObjectExplodeIsPlaying = false;
    this.theEnd = false;
    this.maxLevel = 25;
  }

  create() {
    // DONGEON PART
    if (!this.gameOver) {
      // continue game or new game if level = 0
      this.level++;
    } else {
      // game over so we restart at level 1
      this.level = 1;
      this.gameOver = false;
    }
    
    this.hasPlayerReachedStairs = false;
    if (this.level === this.maxLevel) {
      this.dungeon = new Dungeon({
        width: 50,
        height: 50,
        doorPadding: 2,
        rooms: {
          width: {min: 15, max: 15, onlyOdd: true},
          height: {min: 15, max: 15, onlyOdd: true},
          maxRooms: 1
        }
      });
    } else {
      this.dungeon = new Dungeon({
        width: 50,
        height: 50,
        doorPadding: 2,
        rooms: {
          width: {min: 7, max: 15, onlyOdd: true},
          height: {min: 7, max: 15, onlyOdd: true},
          maxRooms: 12
        }
      });
    }
    

    const map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height
    });

    const tileset = map.addTilesetImage('tiles', null, 16, 16, 0, 0);
    this.doorLayer = map.createBlankDynamicLayer('Front', tileset);
    this.groundLayer = map.createBlankDynamicLayer('Ground', tileset).fill(TILES.BLANK);
    this.objectLayer = map.createBlankDynamicLayer('Object', tileset);
    const shadowLayer = map.createBlankDynamicLayer('Shadow', tileset).fill(TILES.BLANK);
    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    const level = new LevelGenerator(this.dungeon, {
      groundLayer: this.groundLayer,
      objectLayer: this.objectLayer,
    });
    level.init();

    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();

    this.groundLayer.setCollisionByExclusion([5, 6, 7, 15, 16, 17, 20, 25, 26, 43, 45, 46,]);
    this.objectLayer.setCollision([19, 29, 39]);

    // Populate door Layer
    this.groundLayer.forEachTile(tile => {
      if (tile.index === 20) {
        const leftTile = this.groundLayer.getTileAt(tile.x - 1, tile.y);
        const topTile = this.groundLayer.getTileAt(tile.x, tile.y - 1);
        if (leftTile.index === 20) {
          // it's an horizontal door
          this.doorLayer.putTileAt(46, tile.x, tile.y - 1, false);
          this.doorLayer.putTileAt(45, tile.x, tile.y + 1, false);
          this.doorLayer.putTileAt(46, tile.x - 1, tile.y - 1, false);
          this.doorLayer.putTileAt(45, tile.x - 1, tile.y + 1, false);
        }
        if (topTile.index === 20) {
          // it's a vertical door
          this.groundLayer.putTileAt(48, tile.x, tile.y, false);
          this.groundLayer.putTileAt(43, tile.x, tile.y - 1, false);
        }
      }
    });
    
    // PLAYER PART
    //Position player and starting weapon
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX - 1);
    const y = map.tileToWorldY(playerRoom.centerY);
    this.player = new Player(this, x, y, { key: 'atlas'});
    this.player
      .setDepth(10)
      .freeze(true);

    // Load player life
    if (window.localStorage.getItem('dungeonSave')) {
      const arr = JSON.parse(window.localStorage.getItem('dungeonSave'));
      const [life] = arr;
      this.player.life = life;
    }

    // WEAPONS PART
    this.sword = new Sword(this, this.player.x, this.player.y, { key: 'atlas', frame: 'sword0' });

    // SPAWN ENEMIES
    this.spawnOrc2(rooms, map);

    // HANDLE COLLISIONS
    this.objectLayer.setTileIndexCallback(TILES.STAIRS, (e) => {
      if (e instanceof Player) {
        this.objectLayer.setTileIndexCallback(TILES.STAIRS, null);
        this.hasPlayerReachedStairs = true;
        this.player.freeze(true);
        const cam = this.cameras.main;
        cam
          .fade(250, 0, 0, 0)
          .once('camerafadeoutcomplete', () => {
            this.savePlayerData();
            this.mainMusic.destroy();
            this.player.destroy();
            this.scene.restart();
          });
      }
    });

    
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.objectLayer);
    this.physics.add.collider(this.player, this.enemies, () => this.player.getDamage(), null, this);
    this.physics.add.overlap(this.sword, this.objectLayer, (player, obj) => {
      if (obj.index === 9 && this.player.attacking) {
        // Crate top part, dont do anything
        return;
      }
      // crate
      if (obj.index === 19 && this.player.attacking) {
        this.explodeObject(obj.x, obj.y, 0x823414);
        this.objectLayer.removeTileAt(obj.x, obj.y);
        this.objectLayer.removeTileAt(obj.x, obj.y - 1);
        this.lootHeart(obj.x, obj.y);
        return;
      }
      // chest
      if (obj.index === 39 && this.player.attacking) {
        this.explodeObject(obj.x, obj.y, 0x823414);
        this.lootHeart(obj.x, obj.y);
        this.objectLayer.removeTileAt(obj.x, obj.y);
      }
      // skull
      if (obj.index === 29 && this.player.attacking) {
        this.explodeObject(obj.x, obj.y, 0xC59F55);
        this.lootHeart(obj.x, obj.y);
        this.objectLayer.removeTileAt(obj.x, obj.y);
      }
      if (obj.index === 40) {
        // stairs do nothing
        return;
      }
      if (obj.index > 0 && this.player.attacking) {
        this.objectLayer.removeTileAt(obj.x, obj.y);
      }
    }, null, this);

    // HANDLE CAMERA
    const camera = this.cameras.main;
    camera.setZoom(2)
      .startFollow(this.player)
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .fadeIn(250);

    // Add Lights
    this.lights.enable();
    this.lights.setAmbientColor(0x222222);
    this.groundLayer.setPipeline('Light2D');
    this.objectLayer.setPipeline('Light2D');
    this.doorLayer.setPipeline('Light2D');
    this.lightPoint = this.lights.addLight(this.player.x, this.player.y, 64, 0xedcf6d, 1.5);
    this.lightTween = this.tweens.add({
      targets: this.lightPoint,
      intensity: {
        value: 1,
        duration: 120,
        ease: 'Elastic.easeIn',
        repeat: -1,
        yoyo: true
      },
      radius: {
        value: 65.0,
        duration: 200,
        ease: 'Elastic.easeOut',
        repeat: -1,
        yoyo: true
      }
    });

    // HUD
    this.heart1 = this.add.image(map.widthInPixels / 6 , 92, 'atlas').setFrame('heart0').setDepth(20).setScrollFactor(0);
    this.heart2 = this.add.image(map.widthInPixels / 6 + 15, 92, 'atlas').setFrame('heart1').setDepth(20).setScrollFactor(0);
    this.heart3 = this.add.image(map.widthInPixels / 6 + 30, 92, 'atlas').setFrame('heart2').setDepth(20).setScrollFactor(0);
    this.hourGlass = this.add.image(map.widthInPixels / 6 + 178 , 92, 'atlas')
      .setFrame('Hourglass')
      .setDepth(20)
      .setScrollFactor(0)
      .setDisplaySize(9, 9);
    this.handleHudHeart(this.player.life);
    this.levelHud = this.add
      .bitmapText(map.widthInPixels / 6 + 45 , 86, 'atomic', `Level: ${this.level}`, 10, 1)
      .setScrollFactor(0)
      .setDepth(1);
    this.counterHud = this.add
      .bitmapText(map.widthInPixels / 6 + 188 , 86, 'atomic', `3:00`, 10, 1)
      .setScrollFactor(0)
      .setDepth(1);

    this.countDown();
    this.mainMusic;
    this.playMusic();
    this.showLevelSplash();

    if (this.theEnd) {
      this.player.freeze(true);
      this.isTheEnd();
    }
  }

  update(){
    if (this.hasPlayerReachedStairs) return;

    this.lightPoint.x = this.player.x;
    this.lightPoint.y = this.player.y;

    const playerTileX = this.groundLayer.worldToTileX(this.player.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
    this.player.playerRoom = playerRoom;

    // handle visibility of enemies,
    this.checkEnemiesVisibility(playerRoom);

    this.tilemapVisibility.setActiveRoom(playerRoom);
  }

  showLevelSplash() {
    if (this.level === this.maxLevel) {
      this.showBossSplash();
      return;
    }
    this.showLevelText = this.add.bitmapText(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, 'atomic','',1)
      .setFontSize(15)
      .setText(`level ${this.level}`)
      .setOrigin(0.5, 0.5)
      .setDepth(100)
      .setAlpha(1);
    
    if (this.level === 1) {
      this.showLevelText.text = `level ${this.level}\nFind the stairs.\nGo deeper\nKill the Boss`;
    }

    this.tween = this.tweens.add({
      targets: this.showLevelText,
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: this.level === 1 ? 3000 : 750,
      repeat: 0,
      yoyo: false,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0,
      },
      scale: {
        getStart: () => 1,
        getEnd: () => 8,
      },
      onComplete: () => {
        this.theEnd ? this.player.freeze(true) : this.player.freeze(false);
      },
    });
  }

  playMusic() {
    this.mainMusic = this.sound.add('ExMachina');
    this.mainMusic.play({ volume: 0.2, loop: false });
  }

  explodeObject(x, y, color) {
    this.soundObjectExplode();
    const particlesQuantity = 16;
    // particles explosion config
    this.particles = null;
    this.particles = this.add.particles('transparentPixel');
    this.emitter = this.particles.createEmitter({
      angle: { min: -30, max: -150 },
      speed: { min: 50, max: 200 },
      quantity: { min: particlesQuantity, max: particlesQuantity },
      lifespan: { min: 500, max: 1000 },
      tint: color,
      alpha: { start: 1, end: 0 },
      scale: { start: 3, end: 1 },
      gravityY: 300,
      on: false,
    });
    // particles explosion start
    this.particles.emitParticleAt(x * 16, y * 16);
  }

  soundObjectExplode() {
    if (this.soundObjectExplodeIsPlaying) {
      return;
    }
    this.soundObjectExplodeIsPlaying = true;
    this.sndExplode = this.sound.add('explodeFx');
    this.sndExplode.play({ volume: 0.5});
    this.sndExplode.once('complete', () => {
      this.soundObjectExplodeIsPlaying = false;
      if (this) {
        this.sndExplode.destroy();
      }
    });
  }

  countDown() {
    const countDownTimer = this.time.addEvent({
      delay: 1000,
      repeat: 180,
      callback: () => {
        if (this.gameOver) {
          return;
        }
        const time = countDownTimer.getRepeatCount();
        const mn = Math.floor(time / 60); // -> mn
        const ss = time - (60 * mn) ;
        let sec;
        if (ss > 9) {
          sec = ss.toString().length === 1 ? `${ss}0` : ss;
        } else {
          sec = `0${ss}`;
        } 
        this.counterHud.text = `${mn}:${sec}`;
        if (time < 54) {
          if (!this.hourGlass.tintFill) {
            this.hourGlass.setTintFill(0xFF0000);
          } else {
            this.hourGlass.clearTint();
          }
          
        }
        if (time === 0) {
          this.add
            .bitmapText(this.player.x , this.player.y, 'atomic', `Time Over`, 20, 1)
            .setOrigin(0.5, 0.5)
            .setDepth(50)
            .setTint(0xFF0000);
          this.sword.destroy();
          this.player.destroy();
          this.restartNewGame();
        }
      }
    });
  }

  lootHeart(x, y) {
    const rdm = Phaser.Math.Between(0, 100);
    if (rdm > 95 && this.player.life < 5 ) {
      this.player.life += 2;
      this.handleHudHeart(this.player.life);
      const heartImg = this.add.image(x * 16, y * 16, 'atlas').setFrame('heart0').setDepth(10);
      this.tweenHeart = this.tweens.add({
        targets: heartImg,
        duration: 500,
        alpha: {
          getStart: () => 1,
          getEnd: () => 0,
        },
        y: {getStart: () => y * 16, getEnd: () => (y * 16) - 10},
      });
      return;
    }
    if (rdm > 80 && this.player.life < 6 ) {
      this.player.life += 1;
      this.handleHudHeart(this.player.life);
      const heartImg = this.add.image(x * 16, y * 16, 'atlas').setFrame('heart1').setDepth(10);
      this.tweenHeart = this.tweens.add({
        targets: heartImg,
        duration: 500,
        alpha: {
          getStart: () => 1,
          getEnd: () => 0,
        },
        y: {getStart: () => y * 16, getEnd: () => (y * 16) - 10},
      });
    }
  }

  spawnOrc2(rooms, map) {
    if (this.level === this.maxLevel) {
      this.bossRoom();
      return;
    }
    this.enemies = [];
    const maxEnemies = this.level + 1;
    rooms.forEach((room) => {
      const enemyCount = Math.floor(Math.random() * maxEnemies);
      for (let i = 0; i < enemyCount; i++) {

        let spawnX = Phaser.Math.Between(room.left + 1, room.right - 1);
        let spawnY = Phaser.Math.Between(room.bottom - 1, room.top + 1);

        let enemy = new Orc2(this, map.tileToWorldX(spawnX)+9, map.tileToWorldY(spawnY)+4, {
          key: 'orcIdle',
          lvl: this.level,
        });
        this.enemies.push(enemy);
      }
    });

    this.physics.add.overlap(this.sword, this.enemies, (weapon, enemy) => {
      if (this.player.attacking) {
        enemy.die();
      }
    }, null, this);
    this.physics.add.collider(this.enemies, this.groundLayer);
  }

  bossRoom() {
    this.objectLayer.forEachTile(tile => {
      if (tile.index === TILES.STAIRS) {
        this.objectLayer.removeTileAt(tile.x, tile.y);
      }
    });
    this.player.freeze(true);
    let boss = new Boss(this, this.player.x + 60, this.player.y, {
      key: 'atlas',
      lvl: this.level,
      frame: 'boss0',
    });
    boss.setAlpha(1);
    this.physics.add.overlap(this.sword, boss, (weapon, enemy) => {
      if (this.player.attacking) {
        enemy.getDamage();
      }
    }, null, this);
    this.physics.add.collider(boss, this.groundLayer);
    this.physics.add.collider(boss, this.player, () => this.player.getDamage(), null, this);
    boss.freeze(true);
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.player.freeze(false);
        boss.freeze(false);
      }
    });
    
  }

  showBossSplash() {
    this.showLevelText = this.add.bitmapText(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, 'atomic','',1)
      .setFontSize(15)
      .setText(`Final Room`)
      .setOrigin(0.5, 0.5)
      .setDepth(100)
      .setAlpha(1);

    this.tween = this.tweens.add({
      targets: this.showLevelText,
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 750,
      repeat: 0,
      yoyo: false,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0,
      },
      scale: {
        getStart: () => 1,
        getEnd: () => 8,
      },
    });
  }

  checkEnemiesVisibility(playerRoom) {
    if (!this.enemies) {
      return;
    }
    this.enemies.forEach(enemy => {
      const enemyTileX = this.groundLayer.worldToTileX(enemy.x);
      const enemyTileY = this.groundLayer.worldToTileY(enemy.y);
      const enemyRoom = this.dungeon.getRoomAt(enemyTileX, enemyTileY);
      if (enemyRoom == playerRoom && enemy.alpha === 0) {
        enemy.alpha = 1;
      }
    });
  }

  handleHudHeart(life) {
    switch (life) {
    case 5:
      this.heart1.setFrame('heart0');
      this.heart2.setFrame('heart0');
      this.heart3.setFrame('heart1');
      break;

    case 4:
      this.heart1.setFrame('heart0');
      this.heart2.setFrame('heart0');
      this.heart3.setFrame('heart2');
      break;

    case 3:
      this.heart1.setFrame('heart0');
      this.heart2.setFrame('heart1');
      this.heart3.setFrame('heart2');
      break;

    case 2:
      this.heart1.setFrame('heart0');
      this.heart2.setFrame('heart2');
      this.heart3.setFrame('heart2');
      break;

    case 1:
      this.heart1.setFrame('heart1');
      this.heart2.setFrame('heart2');
      this.heart3.setFrame('heart2');
      break;

    case 0:
      this.heart1.setFrame('heart2');
      this.heart2.setFrame('heart2');
      this.heart3.setFrame('heart2');
      break;
    default:
      this.heart1.setFrame('heart0');
      this.heart2.setFrame('heart0');
      this.heart3.setFrame('heart0');
    }
  }
  
  savePlayerData() {
    window.localStorage.setItem('dungeonSave', JSON.stringify([this.player.life]));
  }

  restartNewGame() {
    if (this.gameOver) {
      return;
    }
    this.gameOver = true;
    this.mainMusic.destroy();
    this.gameOverFx = this.sound.add('gameOverFx');
    this.gameOverFx.play({volume: 0.2});
    this.gameOverFx.once('complete', () => {
      if (this) {
        this.gameOverFx.destroy();
      }
    });
    window.localStorage.setItem('dungeonSave', JSON.stringify([6]));
    this.level = 0;
    
    this.retryText = this.add.bitmapText(this.cameras.main.scrollX + 240, this.cameras.main.scrollY + 184, 'atomic')
      .setFontSize(10)
      .setText('Press R to retry')
      .setOrigin(0.5, 0.5)
      .setDepth(100)
      .setAlpha(0);

    this.tween = this.tweens.add({
      targets: this.retryText,
      ease: 'Sine.easeInOut',
      duration: 1500,
      delay: 2000,
      repeat: -1,
      yoyo: true,
      alpha: {
        getStart: () => 0.05,
        getEnd: () => 1,
      },
    });

    this.retrykey = this.input.keyboard.addKey('R');
    this.retrykey.once('up', () => {
      if (this.gameOverFx.isPlaying) {
        this.gameOverFx.destroy();
      }
      this.scene.restart({ level: 0 });
    });
  }

  startEndGame() {
    this.mainMusic.destroy();
    this.gameOverFx = this.sound.add('gameOverFx');
    this.gameOverFx.play({volume: 0.2});
    this.gameOverFx.once('complete', () => {
      if (this) {
        this.gameOverFx.destroy();
        this.level = 0;
        this.scene.restart({ level: 0 });
      }
    });
  }

  isTheEnd() {
    this.player.freeze(true);
    this.endText = this.add.bitmapText(this.player.x + 20, this.player.y - 20, 'atomic', '', 10, 1)
      .setOrigin(0.5, 0.5)
      .setAlpha(1)
      .setDepth(100);
    
    this.time.addEvent({
      delay: 4000,
      loop: false,
      callback: () => {
        this.endText.text = 'hey !!!';
      },
    });
    
    this.time.addEvent({
      delay: 6000,
      loop: false,
      callback: () => {
        this.endText.text = 'Level 1 ???';
      },
    });

    this.time.addEvent({
      delay: 8000,
      loop: false,
      callback: () => {
        this.endText.text = 'what the F$&# ??';
      },
    });
    this.time.addEvent({
      delay: 10000,
      loop: false,
      callback: () => {
        this.endText.text = 'Noooooooo!!!';
      },
    });

    this.time.addEvent({
      delay: 12000,
      loop: false,
      callback: () => {
        this.cameras.main.fadeOut(2500);
        this.scene.start('End');
      },
    });
  }
}
