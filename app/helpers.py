## helpers.py

import time

from app.constants import codes, MOVEMENTS

""" is_action_bad(action, owner)

  In:
    action: int (the action to be verified),
    owner: dict (the sender of the action)

  Out:
    bool
"""
def is_action_bad(action, owner):
  bad_input = action not in codes
  action_time = int(time.time() * 1000) # Milliseconds
  bad_movement = (action in MOVEMENTS and (action_time - owner.get('last_action') < 300))
  bad_action = (action not in MOVEMENTS and (action_time - owner.get('last_action') < 600))

  bad = bad_input or bad_action or bad_movement
  if bad:
    return True
  return False

""" handle_pickup(owner)

  Determines whether a pickup action is successful, and updates
  the map and user accordingly.

  In:
    owner: dict (the sender of the action)

  Out:
    bool
"""
def handle_pickup(owner): # TODO
  cx = curr_cx = owner.get('cx')
  cy = curr_cy = owner.get('cy')
  owner_id = owner.get('username')
  return [cx, cy, owner_id]
