### Constants

## Movement Constants
SPACEBAR = 32
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
  LEFT, UP, RIGHT, DOWN,
  A, W, D, S
)
MOVEMENTS = (
  LEFT, UP, RIGHT, DOWN,
  A, W, D, S
)

DIRECTION_OFFSETS = {
  LEFT: 3,
  UP: 1,
  RIGHT: 2,
  DOWN: 0,
  A: 3, # Left
  W: 1, # Up
  D: 2, # Right
  S: 0 # Down
}


## Map Constants
BORDER_TILES = 7 # Used to ensure user doesn't fall off the map.
DEFAULT_X = 7
DEFAULT_Y = 7
TILE_BUFFER = 30


## Tile Option Constants
BLOCKING = 1


# Not actually constant - TODO later.
users = {}
