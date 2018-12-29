### movement.py
# Handles movement actions.

from app.definitions import MAPS
from app.constants import *

""" move_self(user, direction)

  Checks to see if the player is allowed to move.
  If yes, the new coordinates are returned.

  In:
    user: dict (user data),
    direction: int (direction of movement)

  Out:
    tuple(bool, int, int)
"""
def move_self(user, direction):
  cx = curr_cx = user.get('cx')
  cy = curr_cy = user.get('cy')
  map_data = MAPS.get(user.get('mapId'))
  curr_map = map_data['map']
  ex = len(curr_map[0]) - DEFAULT_X
  ey = len(curr_map) - DEFAULT_Y
  tile_options = map_data['tile_options']

  cx, cy = check_direction(direction, cx, cy, ex, ey)
  tile = curr_map[cy][cx]
  if (type(tile) == list):
    blocked = any([x & BLOCKING for x in tile])
  else:
    blocked = tile_options[tile] & BLOCKING

  if not(blocked) and (cx != curr_cx or cy != curr_cy):
    return True, cx, cy
  return False, curr_cx, curr_cy

""" check_direction(direction, cx, cy, ex, ey)

  Checks the potential direction against boundaries.
  If there is no boundary being hit, modifies the return
  coordinate value accordingly.

  In:
    direction: int (the direction we want to move),
    cx: int (the current x coordinate),
    cy: int (the current y coordinate),
    ex: int (the end x boundary on the map),
    ey: int (the end y boundary on the map)

  Out:
    int, int
"""
def check_direction(direction, cx, cy, ex, ey):
  # Left
  if direction in (37, 65):
    if cx > DEFAULT_X: # Boundary check
      cx -= 1

  # Right
  elif direction in (39, 68):
    if cx < ex: # Boundary check
      cx += 1

  # Down
  elif direction in (40, 83):
    if cy < ey: # Boundary check
      cy += 1

  # Up
  elif direction in (38, 87):
    if cy > DEFAULT_Y: # Boundary check
      cy -= 1

  return cx, cy
