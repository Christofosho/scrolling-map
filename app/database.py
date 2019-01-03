### database.py
# Handles all database queries.

from app import db
from app.models import User

from app.constants import DEFAULT_MAP, DEFAULT_X, DEFAULT_Y

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
    last_login=last_action
  )
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
    db_user = User.query.filter_by(username=user.get('username')).first()
    db_user.x = user.get('cx')
    db_user.y = user.get('cy')
    db_user.map_id = user.get('map_id')
    db_user.last_login = user.get('last_action')
    db.session.commit()

  except Exception as e:
    print("Failed to save user: %s" % user.get('username'))
    print(e)
