## Action Handler

from flask_socketio import emit

import json
import random
import time

from app.constants import DEFAULT_X, DEFAULT_Y, SPACEBAR, TILE_BUFFER, users
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
    'bag': [],
    'lastAction': int(time.time() * 1000) # Milliseconds
  }

  data = [
    user,
    [DEFAULT_X, DEFAULT_Y],
    colour,
    MAPS[users[user].get('mapId')],
    [TILE_BUFFER, DEFAULT_X, DEFAULT_Y]
  ]

  print ("User " + user + " has connected.")

  emit('init_data', json.dumps(data), room=request.sid)
  socket.emit('update_all', json.dumps(users))
  socket.emit('colours', json.dumps(TILES))



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
def distribute(socket, request, data, owner):
  action_occurred = False

  action = data['action']
  if is_input_bad(action, owner):
    return

  if action == SPACEBAR:
    map_data = handle_pickup(owner)
    socket.emit('map_data', json.dumps(map_data))
    action_occurred = True

  else:
    moved, cx, cy = move_self(owner, action)
    if moved:
      users[data['user']]['cx'] = cx
      users[data['user']]['cy'] = cy
      emit('movement_self', json.dumps({
        'user': data['user'],
        'cx': cx,
        'cy': cy
      }), room=request.sid)
      action_occurred = True

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
