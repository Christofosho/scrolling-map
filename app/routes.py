from flask import request, render_template

import json

from app import a, socketio
from app.maps import colours, MAPS

from app.action_handler import *

@a.route("/", methods=['GET'])
def index():
  return render_template('index.html')

@socketio.on('connect')
def connect():
  handle_connect(socketio, request)

@socketio.on('disconnect')
def disconnect():
  handle_disconnect(socketio, request)

@socketio.on('json')
def action(data):
  data = json.loads(data)

  owner = users.get(data['user'])
  if not owner or (data['user'] != request.sid):
    return disconnect()

  distribute(socketio, request, data, owner)

a.secret_key = 'fake'
