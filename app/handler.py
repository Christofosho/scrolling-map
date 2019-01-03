### handler.py
# Handles user input.

import time

from app.definitions import *
from app import constants, database, helpers, movement, sender


class Handler:

  # Not actually constant - TODO later.
  users = {}


  """ handle_connect(socket, request)

    Initializes new users in the users dictionary. Provides
    an updates user list to all users.

    In:
      socket: obj (socket object),
      request: obj (request object)

    Out:
      None
  """
  def handle_connect(self, socket, request, username, authenticated):
    if not authenticated:
      return sender.user_authenticated(request, username, authenticated)

    user = database.retrieve_user(username)
    last_action = int(time.time() * 1000) # Milliseconds

    if (user is None):
      user = database.insert_user(username, last_action)

    self.users[username] = {
      'username': username,
      'current_sid': request.sid,
      'map_id': user.map_id,
      'cx': user.x,
      'cy': user.y,
      'direction': 0,
      'bag': [],
      'last_action': last_action
    }

    data = [
      username,
      [user.x, user.y, 0],
      MAPS[user.map_id],
      [constants.TILE_BUFFER, constants.DEFAULT_X, constants.DEFAULT_Y]
    ]

    print ("User " + username + " has connected.")

    sender.send_initialize_player(request, data)
    sender.send_tile_data(socket, request, TILES)
    sender.update_all_players(socket, self.users)
    sender.user_authenticated(request, username, True)


  """ distribute(socket, request, data)

    Handles user input, calling a function based on the input
    and sending an update to the client(s) based on the result.

    In:
      socket: obj (socket object),
      request: obj (request object),
      data: dict (information being sent),

  """
  def distribute(self, socket, request, data):
    action_occurred = False

    action = data.get('action')
    owner = self.users.get(data.get('username'))

    if helpers.is_action_bad(action, owner):
      return

    if action == constants.SPACEBAR:
      sender.send_map_data(socket, handle_pickup(owner))
      action_occurred = True

    elif action in constants.MOVEMENTS:
      moved, cx, cy = movement.move_self(owner, action)
      owner['direction'] = constants.DIRECTION_OFFSETS[action]
      if moved:
        owner['cx'] = cx
        owner['cy'] = cy
        action_occurred = True

      sender.send_movement(request, owner)
      sender.update_all_players(socket, self.users)

    if action_occurred:
      owner['last_action'] = int(time.time() * 1000) # Milliseconds


  """ handle_disconnect(socket, request)

    Removes a user from the list and updates
    all users with the new user list.

    In:
      socket: obj (socket object),
      request: obj (request object)

  """
  def handle_disconnect(self, socket, request):
    uname_to_sid = {u['current_sid']: u['username']
                    for u in self.users.values()
                    if u['current_sid'] == request.sid}
    if request.sid in uname_to_sid.keys():
      u = uname_to_sid.get(request.sid)
      database.save_user(self.users.get(u))
      del self.users[u]
      print ("User " + u + " has disconnected.")
    sender.update_all_players(socket, self.users)
