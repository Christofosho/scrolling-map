import time

from app.constants import codes, MOVEMENTS

def is_action_bad(action, owner):
  bad_input = action not in codes
  action_time = int(time.time() * 1000) # Milliseconds
  bad_movement = (
    action in MOVEMENTS
    and (action_time - owner.last_action < 300)
  )
  bad_action = (
    action not in MOVEMENTS
    and (action_time - owner.last_action < 600)
  )

  bad = bad_input or bad_action or bad_movement
  if bad:
    return True
  return False

def handle_pickup(owner): # TODO
  cx = curr_cx = owner.x
  cy = curr_cy = owner.y
  owner_id = owner.username
  return [cx, cy, owner_id]
