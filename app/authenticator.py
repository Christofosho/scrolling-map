### authenticator.py
# Manages authentication and confirmation of users.

from app import sender
from app.constants import SETTINGS

""" sanitize_username(username)

  Ensures entered username is only letters.

  In:
    username: str (username of the connecting user)

  Out:
    bool (is username clean?)
"""
def sanitize_username(data):
  username = data.get('username', None)

  # Username was input
  if not username:
    return False

  # Max Length 16
  if len(username) > 16:
    return False

  if len(username) < 3:
    return False

  if not(username.isalpha()):
    return False

  return True

""" register_username(socket, request, handler, username)

  In:
    socket: obj (socket object),
    request: obj (request object),
    handler: obj (handler object)
    username: str (username to register)

"""
def register_username(socket, request, handler, username):
  if handler.users.get(username):
    # User already logged in.
    return handler.handle_connect(socket, request, username, False)

  handler.handle_connect(socket, request, username, True)


""" validate_session(request)

  Determines if the user is already logged in.

  In:
    request: obj (request object),
    data: dict (incoming data from user)

  Out:
    bool
"""
def validate_session(request, handler, data):
  owner = handler.users.get(data.get('username'))
  if owner and (owner.current_sid == request.sid):
    return True
  return False

""" validate_settings(data)

  Ensures the settings data sent in is validated.

  In:
    data: obj (settings included)
  
  Out:
    settings OR empty dict
"""
def validate_settings(data):
  settings = data.get('settings', None)
  if not settings:
    return False

  for k,v  in settings.items():

    if k not in SETTINGS.keys():
      # Invalid setting passed from client.
      return False
    s = SETTINGS.get(k, None)
    if s and v not in s:
      # Invalid value for setting passed from client.
      return False

  return True