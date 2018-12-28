## Action Handler

from flask_socketio import emit

import json
import random
import time

from app.constants import DEFAULT_X, DEFAULT_Y, SPACEBAR, TILE_BUFFER
from app.constants import DIRECTION_OFFSETS, MOVEMENTS, users
from app.helpers import is_input_bad, check_direction, move_self, handle_pickup
from app.definitions import TILES, MAPS


""" handle_connect(socket, request)

  Initializes new users in the users dictionary. Provides
  an updates user list to all users.

  In:
    socket: socket object,
    request: request object

  Out:
    None
"""
def handle_connect(socket, request):
  user = request.sid

  r = lambda: random.randint(0, 255)
  colour = '#%02X%02X%02X' % (r(),r(),r())
  users[user] = {
    'id': user,
    'mapId': 'large',
    'colour': colour,
    'cx': DEFAULT_X,
    'cy': DEFAULT_Y,
    'direction': 0,
    'bag': [],
    'lastAction': int(time.time() * 1000) # Milliseconds
  }

  data = [
    user,
    [DEFAULT_X, DEFAULT_Y, 0],
    colour,
    MAPS[users[user].get('mapId')],
    [TILE_BUFFER, DEFAULT_X, DEFAULT_Y]
  ]

  print ("User " + user + " has connected.")

  emit('init_data', json.dumps(data), room=request.sid)
  socket.emit('tiles', json.dumps(TILES))
  socket.emit('update_all', json.dumps(users))



""" distribute(socket, request, data, owner)

  Handles user input, calling a function based on the input
  and sending an update to the client(s) based on the result.

  In:
    socket: socket object,
    request: request object,
    data: recieved data,
    owner: sender

  Out:
    None
"""
def distribute(socket, request, owner, action):
  action_occurred = False

  if is_input_bad(action, owner):
    return

  if action == SPACEBAR:
    map_data = handle_pickup(owner)
    socket.emit('map_data', json.dumps(map_data))
    action_occurred = True

  elif action in MOVEMENTS:
    moved, cx, cy = move_self(owner, action)
    owner['direction'] = DIRECTION_OFFSETS[action]
    if moved:
      owner['cx'] = cx
      owner['cy'] = cy
      action_occurred = True

    emit('movement_self', json.dumps({
      'user': owner['id'],
      'cx': cx,
      'cy': cy,
      'direction': owner['direction']
    }), room=request.sid)
    socket.emit('update_all', json.dumps(users))

  if action_occurred:
    owner['lastAction'] = int(time.time() * 1000) # Milliseconds


""" handle_disconnect(socket, request)

  Removes a user from the list and updates
  all users with the new user list.

  In:
    socket: socket object,
    request: request object

  Out:
    None
"""
def handle_disconnect(socket, request):
  users.pop(request.sid, 0)
  print ("User " + request.sid + " has disconnected.")
  socket.emit('update_all', json.dumps(users))
