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

movement = (
  LEFT, UP, RIGHT, DOWN,
  A, W, D, S
)

BORDER_TILES = 7 # Used to ensure user doesn't fall off the map.
DEFAULT_X = 7
DEFAULT_Y = 7
TILE_BUFFER = 30

BLOCKING = 1

# Not actually contant - TODO later.
users = {}
