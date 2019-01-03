from flask import request, render_template

import json

from app import a, authenticator, socketio
from app.handler import Handler

handler = Handler()

@a.route("/", methods=['GET'])
def index():
  return render_template('index.html')

@socketio.on('connect')
def connect():
  pass
  # handler.handle_connect(socketio, request)

@socketio.on('disconnect')
def disconnect():
  handler.handle_disconnect(socketio, request)

@socketio.on('authentication')
def authenticate(data):
  data = json.loads(data)
  authenticator.register_username(socketio, request, handler, data.get('username'))

@socketio.on('json')
def action(data):
  data = json.loads(data)

  if not authenticator.already_active(request, handler, data):
    print("Redundant login for %s" % data.get('username', 'UNKNOWN_USER'))
    return disconnect()

  handler.distribute(socketio, request, data)

a.secret_key = 'fake'
