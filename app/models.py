from app import db

import json
from sqlalchemy.ext.hybrid import hybrid_property

class User(db.Model):
  uid = db.Column(db.Integer, primary_key=True, autoincrement=True)
  username = db.Column(db.String(16), unique=True, nullable=False)
  x = db.Column(db.Integer, nullable=False)
  y = db.Column(db.Integer, nullable=False)

  shirt = db.Column(db.Integer, nullable=False)
  hair = db.Column(db.Integer, nullable=False)

  map_id = db.Column(db.String(80), nullable=False)
  last_login = db.Column(db.Integer, nullable=False)
  _bag = db.Column('bag', db.String(128), nullable=False,
                   default='[]', server_default='[]')
  _settings = db.Column('settings', db.String(1024), nullable=False,
                        default='{}', server_default='{}')

  def __repr__(self):
    return '<User %r>' % self.username

  @hybrid_property
  def bag(self):
    return json.loads(self._bag)

  @bag.setter
  def bag(self, b):
    self._bag = json.dumps(b)

  @hybrid_property
  def settings(self):
    return json.loads(self._settings)

  @settings.setter
  def settings(self, s):
    self._settings = json.dumps(s)
