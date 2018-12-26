from flask import Flask
from flask_socketio import SocketIO

a = Flask(__name__)
socketio = SocketIO(a)

from app import routes
