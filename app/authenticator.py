### authenticator.py
# Manages authentication and confirmation of users.

from app.constants import users

""" check_exists(request)

  In:
    request: obj (request object),
    data: dict (incoming data from user)

  Out:
    bool
"""
def check_exists(request, data):
  owner = users.get(data.get('user'))
  if not owner or (data.get('user') != request.sid):
    return False
  return True
