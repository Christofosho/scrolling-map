from app.definitions import MAPS, ENTITIES, PORTALS
from app.constants import BLOCKING, BORDER_TILES, DEFAULT_X, DEFAULT_Y

tile_options = [entity['blocking'] for entity in ENTITIES]

def move_self(user, direction):
  cx = curr_cx = user.x
  cy = curr_cy = user.y
  map_data = MAPS.get(user.map_id)
  ex = len(map_data[0]) - BORDER_TILES
  ey = len(map_data) - BORDER_TILES

  cx, cy = check_direction(direction, cx, cy, ex, ey)
  tile = map_data[cy][cx]
  if (type(tile) == list):
    blocked = any([ENTITIES[x]['blocking'] & BLOCKING for x in tile])
  else:
    blocked = ENTITIES[tile]['blocking'] & BLOCKING

  if not(blocked) and (cx != curr_cx or cy != curr_cy):
    return True, cx, cy
  return False, curr_cx, curr_cy

def check_direction(direction, cx, cy, ex, ey):
  # Left
  if direction in (37, 65):
    if cx > BORDER_TILES: # Boundary check
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
    if cy > BORDER_TILES: # Boundary check
      cy -= 1

  return cx, cy

def check_for_portal(owner):
  map = MAPS.get(owner.map_id)
  tile = map[owner.y][owner.x]
  if (isinstance(tile, list)
    and ENTITIES[tile[1]].get("type") == "portal"):
    # Get our current portal position
    portal = get_portal(owner.map_id, owner.x, owner.y)
    if portal:
      # Get the related portal
      new_portal = get_portal(
        portal.get("related_map"),
        -1, -1,
        related_id=portal.get("related_id")
      )

      owner.map_id = portal.get("related_map")
      owner.x = new_portal.get("x")
      owner.y = new_portal.get("y")
      return True
  return False

def get_portal(map_id, x, y, related_id=-1):

  map_portals = PORTALS.get(map_id)
  for portal in map_portals:

    # Related id has been specified, use it.
    if related_id > -1 and portal.get("portal_id") == related_id:
        return portal

    else:
      # If our user is on the portal,
      # get the related portal info.
      if portal.get("x") == x and portal.get("y") == y:
        return portal

  return {}
