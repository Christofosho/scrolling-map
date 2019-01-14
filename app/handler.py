### handler.py
# Handles user input.

import time

from app import constants, database, helpers
from app import movement, objects, sender
from app.entity.player import Player
from app.definitions import ENTITIES, MAPS


class Handler:

  # Not actually constants - TODO later.
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

    self.users[username] = Player(
      user.uid, username, user.x, user.y, user.map_id,
      request.sid, # Store SID to track session.
      settings=user.settings,
      direction=0, bag=[], last_action=last_action
    )

    print ("User " + username + " has connected.")

    sender.update_all_players(socket, self.users)
    sender.user_authenticated(request, username, True)

  """ send_init_data(username)

  """
  def send_init_data(self, request, username):
    user = self.users.get(username, None)
    if user:
      data = [
        username,
        [user.x, user.y, 0],
        [MAPS[user.map_id], user.map_id],
        ENTITIES,
        user.settings,
        [constants.TILE_BUFFER, constants.BORDER_TILES]
      ]
      sender.send_initialize_player(request, data)

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

    ## Pickup items
    if action == constants.SPACEBAR:
      # sender.send_map_data(socket, handle_pickup(owner))
      action_occurred = True

    ## Use objects
    elif action == constants.E:
      obj, obj_x, obj_y = objects.check_object(
        owner.x,
        owner.y,
        owner.direction,
        owner.map_id
      )

      if obj:
        objects.determine_interaction(socket, owner, obj, obj_x, obj_y)

    ## Move
    elif action in constants.MOVEMENTS:
      moved, cx, cy = movement.move_self(owner, action)
      owner.direction = constants.DIRECTION_OFFSETS[action]
      if moved:
        owner.x = cx
        owner.y = cy
        action_occurred = True

      if movement.check_for_portal(owner):
        sender.send_map_data(socket, self.users)

      sender.send_movement(request, owner)
      sender.update_all_players(socket, self.users)

    if action_occurred:
      owner.last_action = int(time.time() * 1000) # Milliseconds

  """ store_settings(data)

    Stores settings for a player in their player object.

    In:
      data: obj (includes settings)
  """
  def store_settings(self, data):
    owner = self.users.get(data.get('username'))
    settings = data.get('settings')
    owner.settings = settings
    database.save_user(owner)

  """ handle_disconnect(socket, request)

    Removes a user from the list and updates
    all users with the new user list.

    In:
      socket: obj (socket object),
      request: obj (request object)

  """
  def handle_disconnect(self, socket, request):
    uname_to_sid = {u.current_sid: u.username
                    for u in self.users.values()
                    if u.current_sid == request.sid}
    if request.sid in uname_to_sid.keys():
      u = uname_to_sid.get(request.sid)
      database.save_user(self.users.get(u))
      del self.users[u]
      print ("User " + u + " has disconnected.")
    sender.update_all_players(socket, self.users)
