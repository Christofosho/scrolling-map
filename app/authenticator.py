### authenticator.py
# Manages authentication and confirmation of users.

from app import sender

""" sanitize_username(username)

  Ensures entered username is only letters.

  In:
    username: str (username of the connecting user)

  Out:
    bool (is username clean?)
"""
def sanitize_username(username):

  # Max Length 16
  if len(username) > 16:
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


""" already_active(request)

  Determines if the user is already logged in.

  In:
    request: obj (request object),
    data: dict (incoming data from user)

  Out:
    bool
"""
def already_active(request, handler, data):
  owner = handler.users.get(data.get('user'))
  if not owner or (owner.get('current_sid') != request.sid):
    return False
  return True
