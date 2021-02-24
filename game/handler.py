import time

from game import constants, database, helpers
from game import movement, objects, sender
from game.entity.player import Player
from game.definitions import ENTITIES, MAPS


class Handler:

    users = {}

    def handle_connect(self, socket, request, username, authenticated):
        if not authenticated:
            return sender.user_authenticated(request, username, authenticated)

        user = database.retrieve_user(username)
        last_action = int(time.time() * 1000)  # Milliseconds

        if (user is None):
            user = database.insert_user(username, last_action)

        self.users[username] = Player(
            user.uid, username, user.x, user.y,
            user.map_id, user.shirt, user.hair, user.skin,
            user.eyes, user.pants, user.shoes, user.hair_accessory,
            request.sid,  # Store SID to track session.
            settings=user.settings,
            direction=0, bag=[], last_action=last_action
        )

        print("User " + username + " has connected.")

        sender.update_all_players(socket, self.users[username], self.users)
        sender.user_authenticated(request, username, True)

    def send_init_data(self, request, username):
        user = self.users.get(username, None)
        if user:
            data = [
                username,
                [user.x, user.y, 0],
                [MAPS[user.map_id], user.map_id],
                [user.shirt, user.hair, user.skin, user.eyes,
                 user.pants, user.shoes, user.hair_accessory
                 ], ENTITIES, user.settings,
                [constants.TILE_BUFFER, constants.BORDER_TILES],
                {u.username: {
                    'username': u.username,
                    'cx': u.x,
                    'cy': u.y,
                    'direction': u.direction,
                    'shirt': u.shirt,
                    'hair': u.hair,
                    'skin': u.skin,
                    'eyes': u.eyes,
                    'pants': u.pants,
                    'shoes': u.shoes,
                    'hair_accessory': u.hair_accessory
                } for u in self.users.values()
                    if u.map_id == user.map_id
                }
            ]
            sender.send_initialize_player(request, data)

    def distribute(self, socket, request, data):
        action_occurred = False
        transition = False

        action = data.get('action')
        owner = self.users.get(data.get('username'))

        if helpers.is_action_bad(action, owner):
            return

        # Pickup items
        if action == constants.SPACEBAR:
            action_occurred = True

        # Use objects
        elif action == constants.E:
            obj, obj_x, obj_y = objects.check_object(
                owner.x,
                owner.y,
                owner.direction,
                owner.map_id
            )

            if obj:
                objects.determine_interaction(socket, owner, obj, obj_x, obj_y)
                action_occurred = True

        # Move
        elif action in constants.MOVEMENTS:
            moved, cx, cy = movement.move_self(owner, action)
            owner.direction = constants.DIRECTION_OFFSETS[action]
            if moved:
                owner.x = cx
                owner.y = cy

            if movement.check_for_portal(owner):
                sender.send_map_data(socket, self.users)
                transition = True

            action_occurred = True

        if action_occurred:
            sender.update_all_players(socket, owner, self.users, transition)
            owner.last_action = int(time.time() * 1000)  # Milliseconds

    def store_settings(self, data):
        owner = self.users.get(data.get('username'))
        settings = data.get('settings')
        owner.settings = settings
        database.save_user(owner)

    def handle_disconnect(self, socket, request):
        uname_to_sid = {u.current_sid: u
                        for u in self.users.values()
                        if u.current_sid == request.sid}
        u = {}
        if request.sid in uname_to_sid.keys():
            u = uname_to_sid.get(request.sid)
            database.save_user(self.users.get(u.username))
            del self.users[u.username]
            print("User " + u.username + " has disconnected.")

        if u:
            sender.update_all_players(socket, u, self.users, True)
