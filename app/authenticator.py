### authenticator.py
# Manages authentication and confirmation of users.

from app.constants import users
from app import sender, handler

""" register_username(username)

  In:
    username: str (username to register)

"""
def register_username(socket, request, username):
  if users.get(username):
    # User already exists.
    return handler.handle_connect(socket, request, username, False)

  handler.handle_connect(socket, request, username, True)


""" check_exists(request)

  In:
    request: obj (request object),
    data: dict (incoming data from user)

  Out:
    bool
"""
def check_exists(request, data):
  owner = users.get(data.get('user'))
  if not owner or (owner.get('current_sid') != request.sid):
    return False
  return True
