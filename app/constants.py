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

defaultx = 7
defaulty = 7

# Not actually contants - TODO later.
users = {}

from app.maps import MAPS
current_map = dict(MAPS['default']) # Take a copy
