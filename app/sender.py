### sender.py
# Sends packets to the client.

from flask_socketio import emit
from app.definitions import MAPS

import json

def user_authenticated(request, username, authenticated):
  emit('authenticated', json.dumps({'success': authenticated, 'username': username}), room=request.sid)

""" send_initialize_player(request, data)

  In:
    request: obj (request object),
    data: dict (initial player data)

"""
def send_initialize_player(request, data):
  emit('init_data', json.dumps(data), room=request.sid)

""" send_object_action(socket, tiles)

  In:
    socket: obj (socket object),
    tiles: dict (tile definition set)

"""
def send_object_action(socket, request, tiles):
  socket.emit('tiles', json.dumps(tiles), room=request.sid)

""" update_all_players(socket, users_data)

  In:
    socket: obj (socket object),
    users_data: dict (all user data)

"""
def update_all_players(socket, users_data):
  # Only need to send x, y, direction, username.
  for user in users_data.values():
    socket.emit('update_all', json.dumps(
    {u: {
      'cx': d.x,
      'cy': d.y,
      'direction': d.direction,
      'username': d.username
    } for u, d in users_data.items()
    if d.map_id == user.map_id}
    ), room=user.current_sid)

""" send_map_data(socket, map_data)

  In:
    socket: obj (socket object),
    map_data: list (updated data about the map)

"""
def send_map_data(socket, users):
  for user in users.values():
    map = MAPS[user.map_id]
    socket.emit('map_data', json.dumps(map), room=user.current_sid)

""" send_movement(request, owner)

  In:
    request: obj (request object),
    owner: dict (user data)

"""
def send_movement(request, owner):
  emit('movement_self', json.dumps({
    'username': owner.username,
    'cx': owner.x,
    'cy': owner.y,
    'direction': owner.direction
  }), room=request.sid)
