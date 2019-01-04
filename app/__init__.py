from flask import Flask
a = Flask(__name__)

from flask_socketio import SocketIO
socketio = SocketIO(a)

from flask_sqlalchemy import SQLAlchemy
a.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/test.db'
a.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(a)

from app import routes
from app.models import User
from app import entity