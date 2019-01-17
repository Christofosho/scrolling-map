### database.py
# Handles all database queries.

from app import db
from app.models import User

from app.constants import DEFAULT_MAP, DEFAULT_X, DEFAULT_Y, SETTINGS

""" retrieve_user(username)

  Finds a user in the database by their username. Returns
  None if a user is not found.

  In:
    username: str (the username to look for)

  Out:
    User database object
"""
def retrieve_user(username):
  return User.query.filter_by(username=username).first()

""" insert_user(username, last_action)

  Adds a new user to the database.

  In:
    username: str (username of the user)
    last_action: int (time the user last logged in)
"""
def insert_user(username, last_action):
  user = User(
    username=username,
    x=DEFAULT_X, y=DEFAULT_Y,
    map_id=DEFAULT_MAP,
    last_login=last_action,
    shirt=0, hair=0
  )
  user.settings = {k:v[0] for k,v in SETTINGS.items()}
  db.session.add(user)
  db.session.commit()
  return user

""" save_user(user)

  Saves a user's data.

  In:
    user: obj (user data)
"""
def save_user(user):
  try:
    db_user = User.query.filter_by(username=user.username).first()
    db_user.x = user.x
    db_user.y = user.y
    db_user.map_id = user.map_id
    db_user.last_login = user.last_action
    db_user.settings = user.settings
    db_user.shirt = user.shirt
    db_user.hair = user.hair
    db.session.commit()

  except Exception as e:
    print("Failed to save user: %s" % user.username)
    print(e)
