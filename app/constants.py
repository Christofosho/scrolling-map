### constants.py
# Any constant values can be placed here for easier access.

## Movement Constants
SPACEBAR = 32
E = 69
LEFT = 37
UP = 38
RIGHT = 39
DOWN = 40
A = 65 # Left
W = 87 # Up
D = 68 # Right
S = 83 # Down
codes = (
  SPACEBAR,
  E,
  LEFT, UP, RIGHT, DOWN,
  A, W, D, S
)
MOVEMENTS = (
  LEFT, UP, RIGHT, DOWN,
  A, W, D, S
)

OFFSET_DOWN = 0
OFFSET_UP = 1
OFFSET_RIGHT = 2
OFFSET_LEFT = 3

DIRECTION_OFFSETS = {
  LEFT: OFFSET_LEFT,
  UP: OFFSET_UP,
  RIGHT: OFFSET_RIGHT,
  DOWN: OFFSET_DOWN,
  A: OFFSET_LEFT,
  W: OFFSET_UP,
  D: OFFSET_RIGHT,
  S: OFFSET_DOWN
}


## Map Constants
BORDER_TILES = 7 # Used to ensure user doesn't fall off the map.
DEFAULT_X = 9
DEFAULT_Y = 10
TILE_BUFFER = 30
DEFAULT_MAP = "Your Dormatory Room"

## Tile Option Constants
BLOCKING = 1

## Settings
SETTINGS = { # Default first
  'player_names': [True, False],
  'coordinates': [False, True]
}