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

def insert_user(username, last_action):
  user = User(
    username=username,
    x=DEFAULT_X, y=DEFAULT_Y,
    map_id=DEFAULT_MAP,
    last_login=last_action
  )
  db.session.add(user)
  db.session.commit()
