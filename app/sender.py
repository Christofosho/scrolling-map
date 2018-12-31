### sender.py
# Sends packets to the client.

from flask_socketio import emit

import json

def user_authenticated(request, username, authenticated):
  emit('authenticated', json.dumps({'success': authenticated}), room=request.sid)

""" send_initialize_player(request, data)

  In:
    request: obj (request object),
    data: dict (initial player data)

"""
def send_initialize_player(request, data):
  emit('init_data', json.dumps(data), room=request.sid)

""" send_tile_data(socket, tiles)

  In:
    socket: obj (socket object),
    tiles: dict (tile definition set)

"""
def send_tile_data(socket, request, tiles):
  socket.emit('tiles', json.dumps(tiles), room=request.sid)

""" update_all_players(socket, users_data)

  In:
    socket: obj (socket object),
    users_data: dict (all user data)

"""
def update_all_players(socket, users_data):
  socket.emit('update_all', json.dumps(users_data))

""" send_map_data(socket, map_data)

  In:
    socket: obj (socket object),
    map_data: list (updated data about the map)

"""
def send_map_data(socket, map_data):
  socket.emit('map_data', json.dumps(map_data))

""" send_movement(request, owner)

  In:
    request: obj (request object),
    owner: dict (user data)

"""
def send_movement(request, owner):
  emit('movement_self', json.dumps({
    'username': owner['username'],
    'cx': owner['cx'],
    'cy': owner['cy'],
    'direction': owner['direction']
  }), room=request.sid)
