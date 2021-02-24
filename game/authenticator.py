from game import sender
from game.constants import SETTINGS


def sanitize_username(data):
    username = data.get('username', None)

    # Username was input
    if not username:
        return False

    # Max Length 16
    if len(username) > 16:
        return False

    if len(username) < 3:
        return False

    if not(username.isalpha()):
        return False

    return True


def register_username(socket, request, handler, username):
    if handler.users.get(username):
        # User already logged in.
        return handler.handle_connect(socket, request, username, False)

    handler.handle_connect(socket, request, username, True)


def validate_session(request, handler, data):
    owner = handler.users.get(data.get('username'))
    if owner and (owner.current_sid == request.sid):
        return True
    return False


def validate_settings(data):
    settings = data.get('settings', None)
    if not settings:
        return False

    for k, v in settings.items():

        if k not in SETTINGS.keys():
            # Invalid setting passed from client.
            return False
        s = SETTINGS.get(k, None)
        if s and v not in s:
            # Invalid value for setting passed from client.
            return False

    return True
