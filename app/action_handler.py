## Action Handler

from flask_socketio import emit

import json
import random
import time
import uuid

from app.constants import defaultx, defaulty, SPACEBAR, users
from app.helpers import is_input_bad, check_direction, move_self, handle_pickup
from app.definitions import TILES, MAPS

def handle_connect(socket, request):
  user = request.sid

  r = lambda: random.randint(0, 255)
  colour = '#%02X%02X%02X' % (r(),r(),r())
  users[user] = {
    'id': user,
    'mapId': 'small',
    'colour': colour,
    'cx': defaultx,
    'cy': defaulty,
    'bag': [],
    'lastAction': int(time.time() * 1000) # Milliseconds
  }

  data = [
    user,
    [defaultx, defaulty],
    colour,
    MAPS[users[user].get('mapId')]
  ]

  print ("User " + user + " has connected.")

  emit('init_data', json.dumps(data), room=request.sid)
  socket.emit('update_all', json.dumps(users))
  socket.emit('colours', json.dumps(TILES))



""" distribute(socket, request, data, owner)
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

def handle_disconnect(socket, request):
  users.pop(request.sid, 0)
  print ("User " + request.sid + " has disconnected.")
  socket.emit('update_all', json.dumps(users))
