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


@socketio.on('logout')
def logout():
    handler.handle_disconnect(socketio, request)


@socketio.on('disconnect')
def disconnect():
    handler.handle_disconnect(socketio, request)


@socketio.on('authentication')
def authenticate(data):
    data = json.loads(data)
    clean = authenticator.sanitize_username(data)
    if clean:
        return authenticator.register_username(
            socketio, request, handler, data.get('username')
        )

    handler.handle_connect(socketio, request, data.get('username'), False)


@socketio.on('retrieve_init_data')
def retrieve_init_data(data):
    data = json.loads(data)
    clean = authenticator.sanitize_username(data)
    if clean:
        return handler.send_init_data(request, data.get('username'))

    handler.handle_connect(socketio, request, data.get('username'), False)


@socketio.on('json')
def action(data):
    data = json.loads(data)
    clean = authenticator.sanitize_username(data)
    if not clean:
        return

    valid = authenticator.validate_session(request, handler, data)
    if not valid:
        print("Bad login for %s" % data.get('username', 'UNKNOWN_USER'))
        return disconnect()

    handler.distribute(socketio, request, data)


@socketio.on('settings')
def settings(data):
    data = json.loads(data)
    clean = authenticator.sanitize_username(data)
    if not clean:
        return

    valid = authenticator.validate_session(request, handler, data)
    if not valid:
        print("Bad login for %s" % data.get('username', 'UNKNOWN_USER'))
        return disconnect()

    settings = authenticator.validate_settings(data)
    if settings:
        handler.store_settings(data)
