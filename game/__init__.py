from flask import Flask
a = Flask(__name__)

from flask_socketio import SocketIO
socketio = SocketIO(a,
  cors_credentials=True,
  cors_allowed_origins=[
    "http://localhost:5000",
    "https://scrolling-map.herokuapp.com"
  ],
  logger=True, engineio_logger=True
)

from flask_sqlalchemy import SQLAlchemy
a.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/test.db'
a.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(a)

a.secret_key = 'fake'

from game import routes
from game.models import User
from game import entity