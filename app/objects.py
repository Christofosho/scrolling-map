### objects.py

from app import sender
from app import database
from app.definitions import MAPS, ENTITIES
from app.constants import OFFSET_LEFT, OFFSET_RIGHT, OFFSET_UP, OFFSET_DOWN
from app.constants import HAIR_ACCESSORY, SHIRTS

""" check_object(x, y, dir, map)

    Returns the object id at the position player is facing.

    In:
        x: int (x coordinate of player),
        y: int (y coordinate of player),
        dir: int (direction player is facing),
        map: str (map id player is on)
    
    Out:
        int (object id)
"""
def check_object(x, y, dir, map):
    map = MAPS.get(map, None)
    obj_x = x
    obj_y = y

    if dir == OFFSET_LEFT:
        obj_x -= 1
    
    elif dir == OFFSET_RIGHT:
        obj_x += 1

    elif dir == OFFSET_UP:
        obj_y -= 1

    elif dir == OFFSET_DOWN:
        obj_y += 1

    obj = map[obj_y][obj_x]

    # We can only have an object on top of a tile,
    # so the map index _must_ be a list.
    if isinstance(obj, list):

        # Each map index has precedence where:
        # tile will always be index 0
        # object will be index 1 if exists
        # item can be index 1, or 2 if object exists
        obj = ENTITIES[obj[1]]
        if obj and obj.get('type', None) == "object":
            return obj, obj_x, obj_y

    return None, -1, -1

def determine_interaction(socket, owner, obj, obj_x, obj_y):

    # Some objects have specific associated interaction.
    interaction = obj.get('interact', None)
    if not interaction:
        # Object has no interaction method.
        return
        
    ## Handle various interaction types.

    # Doors, ...
    if interaction == "replace":
        replace_object(socket, owner, obj, obj_x, obj_y)

    # Dresser, ...
    elif interaction == "change":
        owner.shirt += 1
        if owner.shirt > SHIRTS[-1]:
            owner.shirt = 0
        database.save_user(owner)

    # Bedside Table, ...
    elif interaction == "hairaccessory":
        # 0: none
        # 1: bow
        owner.hair_accessory += 1
        if owner.hair_accessory > HAIR_ACCESSORY[-1]:
            owner.hair_accessory = 0
        database.save_user(owner)

    # Bed, ...
    elif interaction == "regenerate":
        pass

def replace_object(socket, owner, obj, obj_x, obj_y):
    replace = obj.get("related_entity_id", None)
    if replace is None:
        # Object does not have a replacement
        return

    map = MAPS.get(owner.map_id, None)
    if map is None:
        # Owner's map is invalid.
        return
    
    # Object index is always 1
    MAPS[owner.map_id][obj_y][obj_x][1] = replace
    sender.send_map_data(socket, map)
