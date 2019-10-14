const TILES_MAPPING = {
  BLANK: 0,
  WALL: {
    LEFT: [{index: 1, weight: 4}],
    RIGHT: [{index: 2, weight: 4}],
    TOP_LEFT: [{index: 21, weight: 1}],
    TOP_RIGHT:[{index: 22, weight: 1}],
    BOTTOM_LEFT: [{index: 41, weight: 1}],
    BOTTOM_RIGHT: [{index: 42, weight :1}],
    TOP: [{ index: 3, weight: 4 }, { index: [23, 3], weight: 1 }],
  },
  FLOOR: [{ index: 5, weight: 4 }, { index: [6, 7, 15, 16, 17], weight: 1 }],
  BOX: [
    [9],
    [19]
  ],
  DOOR: 20,
  CHEST: 39,
  SKULL: 29,
  STAIRS: 40
};

export default TILES_MAPPING;
