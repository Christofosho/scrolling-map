from flask import request, render_template

import json

from app import a, authenticator, handler, socketio

@a.route("/", methods=['GET'])
def index():
  return render_template('index.html')

@socketio.on('connect')
def connect():
  handler.handle_connect(socketio, request)

@socketio.on('disconnect')
def disconnect():
  handler.handle_disconnect(socketio, request)

@socketio.on('json')
def action(data):
  data = json.loads(data)

  if not authenticator.check_exists(request, data):
    return disconnect()

  handler.distribute(socketio, request, data)

a.secret_key = 'fake'
