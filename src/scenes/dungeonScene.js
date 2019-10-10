import { Scene } from 'phaser';
// import U from '../utils/usefull';
import Dungeon from '@mikewesthad/dungeon';
import Player from '../player/player';
import Sword from '../weapons/sword';
// import Weapon from '../weapons/weapon';
// import Sword_Basic from '../weapons/sword-basic';
import TILES from '../plugins/tiles-mapping';
import TilemapVisibility from '../plugins/tilemap-visibility';
import LevelGenerator from '../plugins/level-generator';
// import { runInThisContext } from 'vm';
import Orc2 from '../monsters/Orc2';

export default class DungeonScene extends Scene {
  constructor() {
    super({key: 'DungeonScene'});
    this.level = 0;
  }

  preload() {
    

  }

  create() {
    // DONGEON PART
    this.level++;
    this.hasPlayerReachedStairs = false;
    
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

    const map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height
    });

    const tileset = map.addTilesetImage('tiles', null, 16, 16, 0, 0);
    this.groundLayer = map.createBlankDynamicLayer('Ground', tileset).fill(TILES.BLANK);
    this.objectLayer = map.createBlankDynamicLayer('Object', tileset);
    const shadowLayer = map.createBlankDynamicLayer('Shadow', tileset).fill(TILES.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    const level = new LevelGenerator(this.dungeon, {groundLayer: this.groundLayer, objectLayer: this.objectLayer});
    level.init();

    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();

    this.groundLayer.setCollisionByExclusion([129, 130, 131, 161, 162, 163, 194]);
    this.objectLayer.setCollision([430, 431, 462]);
    
    // PLAYER PART
    //Position player and starting weapon
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX);
    const y = map.tileToWorldY(playerRoom.centerY);
    this.player = new Player(this, x, y, { key: 'knight-idle'});
    this.player.setDepth(10);

    // this.weapon = new Sword_Basic(this);
    // this.weapon.pickupWeapon(this.player);
    // this.weapon.setDepth(10);

    // Load player life
    if (window.localStorage.getItem('dungeonSave')) {
      const arr = JSON.parse(window.localStorage.getItem('dungeonSave'));
      const [life] = arr;
      this.player.life = life;
      //this.level = level;
    }

    // WEAPONS PART
    this.sword = new Sword(this, this.player.x, this.player.y, { key: 'sword' });
    // this.swordGroup = this.physics.add.group({
    //   classType: Sword,
    //   maxSize: 10,
    //   allowGravity: false,
    //   createIfNull: true,
    // });

    
    this.spawnOrc2(rooms, map);

    this.objectLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.objectLayer.setTileIndexCallback(TILES.STAIRS, null);
      this.hasPlayerReachedStairs = true;
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once('camerafadeoutcomplete', () => {
        this.savePlayerData();
        this.player.destroy();
        this.scene.restart();
      });
    });

    
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.objectLayer);
    this.physics.add.collider(this.player, this.enemies, () => this.player.getDamage(), null, this);
    //this.physics.add.collider(this.sword, this.grouLayer, (sword, elm) => elm.destroy(), null, this);
    /* 
    * Check for collision overlap between weapons and objectLayer
    * TODO: add breaking object animation, add breaking object sound
    */
    this.physics.add.overlap(this.sword, this.objectLayer, (player, obj) => {
      if (obj.index === 398 && this.player.attacking) {
        // Crate top part, dont do anything
        return;
      }
      if (obj.index === 430 && this.player.attacking) {
        this.objectLayer.removeTileAt(obj.x, obj.y);
        this.objectLayer.removeTileAt(obj.x, obj.y - 1);
        return;
      }
      if (obj.index > 0 && this.player.attacking) {
        this.objectLayer.removeTileAt(obj.x, obj.y);
      }
    }, null, this);


    const camera = this.cameras.main;
    camera.setZoom(2);
    camera.startFollow(this.player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // this.add
    //   .text(map.widthInPixels / 2 - 190, 160, `Find the stairs. Go deeper.\nCurrent level: ${this.level}`, {
    //     font: '8px monospace',
    //     fill: '#000000',
    //     padding: { x: 10, y: 10 },
    //     backgroundColor: '#ffffff'
    //   })
    //   .setScrollFactor(0)
    //   .setDepth(1);
    
    // Add Lights
    this.lights.enable();
    this.lights.setAmbientColor(0x222222);
    this.groundLayer.setPipeline('Light2D');
    this.objectLayer.setPipeline('Light2D');
    this.lightPoint = this.lights.addLight(this.player.x, this.player.y, 70, 0xedcf6d, 1);
    this.tweens.add({
      targets: this.lightPoint,
      intensity: {
        value: 1.5,
        duration: 120,
        ease: 'Elastic.easeIn',
        repeat: -1,
        yoyo: true
      },
      radius: {
        value: 71.0,
        duration: 200,
        ease: 'Elastic.easeOut',
        repeat: -1,
        yoyo: true
      }
    });

    // HUD
    // this.heart1 = this.add.image(map.widthInPixels / 2 - 80, 192, 'heart').setDepth(20).setScrollFactor(0);
    // this.heart2 = this.add.image(map.widthInPixels / 2 - 65, 192, 'heart').setDepth(20).setScrollFactor(0);
    // this.heart3 = this.add.image(map.widthInPixels / 2 - 50, 192, 'heart').setDepth(20).setScrollFactor(0);
    // this.handleHudHeart(this.player.life);
  }

  /**
   *  Handles updates to game logic, physics and game objects.
   *
   *  @protected
   *  @param {number} t - Current internal clock time.
   *  @param {number} dt - Time elapsed since last update.
   */
  update(/* t, dt */){
    if (this.hasPlayerReachedStairs) return;
    this.player.update();
    this.lightPoint.x = this.player.x;
    this.lightPoint.y = this.player.y;

    const playerTileX = this.groundLayer.worldToTileX(this.player.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    // handle visibility of enemies,
    this.checkEnemiesVisibility(playerRoom);

    this.tilemapVisibility.setActiveRoom(playerRoom);
  }

  //Spawns up to four enemies per room. Change maxEnemies parameter to tweak.
  // spawnEnemies(rooms, map) {
  //   this.enemies = [];
  //   const maxEnemies = 4;

  //   rooms.forEach(room => {

  //     const enemyCount = Math.floor(Math.random() * maxEnemies);
  //     for (let i = 0; i < enemyCount; i++) {
        
  //       let spawnX = Phaser.Math.Between(room.left + 1, room.right - 1);
  //       let spawnY = Phaser.Math.Between(room.bottom - 1, room.top + 1);

  //       let enemy = new Orc(this, map.tileToWorldX(spawnX)+9, map.tileToWorldY(spawnY)+4);
  //       this.enemies.push(enemy);
  //     }
  //   });
  // }

  /* Like SpawnEnemies but only one class
  * I didn't succeed to get it working with monster and orc, so i made like i do usually
  * Orc2 are red tinted to see difference
  */
  spawnOrc2(rooms, map) {
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
    /* 
    * Check for collision overlap between weapons and monsters
    * TODO: add breaking object animation, add breaking object sound
    */
    this.physics.add.overlap(this.sword, this.enemies, (weapon, enemy) => {
      if (this.player.attacking) {
        enemy.destroy();
      }
    }, null, this);
    this.physics.add.collider(this.enemies, this.groundLayer);
  }

  checkEnemiesVisibility(playerRoom) {
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
      this.heart1.setFrame(0);
      this.heart2.setFrame(0);
      this.heart3.setFrame(1);
      break;

    case 4:
      this.heart1.setFrame(0);
      this.heart2.setFrame(0);
      this.heart3.setFrame(2);
      break;

    case 3:
      this.heart1.setFrame(0);
      this.heart2.setFrame(1);
      this.heart3.setFrame(2);
      break;

    case 2:
      this.heart1.setFrame(0);
      this.heart2.setFrame(2);
      this.heart3.setFrame(2);
      break;

    case 1:
      this.heart1.setFrame(1);
      this.heart2.setFrame(2);
      this.heart3.setFrame(2);
      break;

    case 0:
      this.heart1.setFrame(2);
      this.heart2.setFrame(2);
      this.heart3.setFrame(2);
      break;
    default:
      this.heart1.setFrame(0);
      this.heart2.setFrame(0);
      this.heart3.setFrame(0);
    }
  }
  
  savePlayerData() {
    const arr = [];
    arr.push(
      this.player.life,
    );
    window.localStorage.setItem('dungeonSave', JSON.stringify(arr));
  }

  /**
   *  Called after a scene is rendered. Handles rendenring post processing.
   *
   *  @protected
   */
  render() {
  }

  /**
   *  Called when a scene is about to shut down.
   *
   *  @protected
   */
  shutdown() {
  }

  /**
   *  Called when a scene is about to be destroyed (i.e.: removed from scene
   *  manager). All allocated resources that need clean up should be freed up
   *  here.
   *
   *  @protected
   */
  destroy() {
  }
}
