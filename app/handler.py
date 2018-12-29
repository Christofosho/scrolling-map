### handler.py
# Handles user input.

import time

from app.constants import DEFAULT_X, DEFAULT_Y, SPACEBAR, TILE_BUFFER
from app.constants import DIRECTION_OFFSETS, MOVEMENTS, users
from app.definitions import MAPS, TILES
from app.helpers import is_input_bad, handle_pickup
from app.movement import move_self

from app import sender


""" handle_connect(socket, request)

  Initializes new users in the users dictionary. Provides
  an updates user list to all users.

  In:
    socket: obj (socket object),
    request: obj (request object)

  Out:
    None
"""
def handle_connect(socket, request):
  user = request.sid
  users[user] = {
    'id': user,
    'mapId': 'large',
    'cx': DEFAULT_X,
    'cy': DEFAULT_Y,
    'direction': 0,
    'bag': [],
    'lastAction': int(time.time() * 1000) # Milliseconds
  }

  data = [
    user,
    [DEFAULT_X, DEFAULT_Y, 0],
    MAPS[users[user].get('mapId')],
    [TILE_BUFFER, DEFAULT_X, DEFAULT_Y]
  ]

  print ("User " + user + " has connected.")

  sender.send_initialize_player(request, data)
  sender.send_tile_data(socket, TILES)
  sender.update_all_players(socket, users)



""" distribute(socket, request, data, owner)

  Handles user input, calling a function based on the input
  and sending an update to the client(s) based on the result.

  In:
    socket: obj (socket object),
    request: obj (request object),
    owner: dict (sender that is performing the action),
    action: int (action being performed)

"""
def distribute(socket, request, data):
  action_occurred = False

  action = data.get('action')
  owner = users.get(data.get('user'))

  if is_input_bad(action, owner):
    return

  if action == SPACEBAR:
    sender.send_map_data(socket, handle_pickup(owner))
    action_occurred = True

  elif action in MOVEMENTS:
    moved, cx, cy = move_self(owner, action)
    owner['direction'] = DIRECTION_OFFSETS[action]
    if moved:
      owner['cx'] = cx
      owner['cy'] = cy
      action_occurred = True

    sender.send_movement(request, owner)
    sender.update_all_players(socket, users)

  if action_occurred:
    owner['lastAction'] = int(time.time() * 1000) # Milliseconds


""" handle_disconnect(socket, request)

  Removes a user from the list and updates
  all users with the new user list.

  In:
    socket: obj (socket object),
    request: obj (request object)

"""
def handle_disconnect(socket, request):
  users.pop(request.sid, 0)
  print ("User " + request.sid + " has disconnected.")
  sender.update_all_players(socket, users)
