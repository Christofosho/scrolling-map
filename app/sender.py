from flask_socketio import emit
from app.definitions import MAPS

import json


def user_authenticated(request, username, authenticated):
    emit('authenticated', json.dumps(
        {'success': authenticated, 'username': username}), room=request.sid)


def send_initialize_player(request, data):
    emit('init_data', json.dumps(data), room=request.sid)


def send_object_action(socket, request, tiles):
    socket.emit('tiles', json.dumps(tiles), room=request.sid)


def update_all_players(socket, owner, users, transition=False):
    data = owner.getAllData()

    if owner in users.values():
        for user in [*users.values()]:

            # Same map means update.
            if user.map_id == owner.map_id:
                socket.emit('update_player',
                            json.dumps(data), room=user.current_sid)

                # Owner is moving to new map, send update to them with user data.
                if transition:
                    socket.emit('update_player',
                                json.dumps(user.getAllData()), room=owner.current_sid)

            # Different map means remove.
            else:
                socket.emit('remove_user',
                            json.dumps({'username': owner.username}), room=user.current_sid)

                # User is moving to another map or something similar.
                if transition:
                    socket.emit('remove_user',
                                json.dumps({'username': user.username}), room=owner.current_sid)

    # Owner doesn't exist. Remove them.
    else:
        socket.emit('remove_user',
                    json.dumps({'username': owner.username}), room=owner.current_sid)
        for user in users.values():
            socket.emit('remove_user',
                        json.dumps({'username': owner.username}), room=user.current_sid)


def send_map_data(socket, users):
    for user in users.values():
        map = MAPS[user.map_id]
        socket.emit('map_data', json.dumps(
            [map, user.map_id]), room=user.current_sid)
