## helpers.py

import time

from app.maps import MAPS
from app.constants import *

def is_input_bad(action, owner):
  bad_input = action not in codes
  action_time = int(time.time() * 1000) # Milliseconds
  bad_movement = (action in movement and (action_time - owner.get('lastAction') < 300))
  bad_action = (action not in movement and (action_time - owner.get('lastAction') < 600))

  bad = bad_input or bad_action or bad_movement
  if bad:
    return True
  return False

# This paints for now.
def handle_pickup(owner):
  cx = curr_cx = owner.get('cx')
  cy = curr_cy = owner.get('cy')
  owner_id = owner.get('id')
  current_map['map'][cy][cx] = owner_id
  return [cx, cy, owner_id]

def move_self(user, direction):
  cx = curr_cx = user.get('cx')
  cy = curr_cy = user.get('cy')
  map_data = MAPS.get(user.get('mapId'))
  curr_map = map_data['map']
  sx = map_data['sx']
  sy = map_data['sy']
  ex = map_data['ex']
  ey = map_data['ey']
  noWalkTiles = map_data['noWalk']

  cx, cy = check_direction(direction, cx, cy, sx, sy, ex, ey)

  if (curr_map[cy][cx] not in noWalkTiles
      and (cx != curr_cx or cy != curr_cy)):
    return True, cx, cy
  return False, cx, cy

def check_direction(direction, cx, cy, sx, sy, ex, ey):
  # Left
  if direction in (37, 65):
    if cx > sx: # Boundary check
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
    if cy > sy: # Boundary check
      cy -= 1

  return cx, cy
