# Movement Constants
SPACEBAR = "Space"
E = "KeyE"
LEFT = "ArrowLeft"
UP = "ArrowUp"
RIGHT = "ArrowRight"
DOWN = "ArrowDown"
A = "KeyA"  # Left
W = "KeyW"  # Up
D = "KeyD"  # Right
S = "KeyS"  # Down
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


# Map Constants
BORDER_TILES = 7  # Used to ensure user doesn't fall off the map.
DEFAULT_X = 9
DEFAULT_Y = 10
TILE_BUFFER = 30
DEFAULT_MAP = "Your Dormatory Room"

# Tile Option Constants
BLOCKING = 1

# Settings
SETTINGS = {  # Default first
    'player_names': [True, False],
    'coordinates': [False, True],
    'zoom': [False, True]
}

SHIRTS = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9
]

HAIR = [
    0
]

SKIN = [
    0
]

EYES = [
    0
]

PANTS = [
    0
]

SHOES = [
    0
]

HAIR_ACCESSORY = [
    0, 1
]
