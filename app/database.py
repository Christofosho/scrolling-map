from app import db
from app.models import User

from app.constants import DEFAULT_MAP, DEFAULT_X, DEFAULT_Y, SETTINGS


def retrieve_user(username):
    return User.query.filter_by(username=username).first()


def insert_user(username, last_action):
    user = User(
        username=username,
        x=DEFAULT_X, y=DEFAULT_Y,
        map_id=DEFAULT_MAP,
        last_login=last_action,
        shirt=0, hair=0, skin=0, eyes=0,
        pants=0, shoes=0, hair_accessory=0
    )
    user.settings = {k: v[0] for k, v in SETTINGS.items()}
    db.session.add(user)
    db.session.commit()
    return user


def save_user(user):
    try:
        db_user = User.query.filter_by(username=user.username).first()
        db_user.x = user.x
        db_user.y = user.y
        db_user.map_id = user.map_id
        db_user.last_login = user.last_action
        db_user.settings = user.settings
        db_user.shirt = user.shirt
        db_user.hair = user.hair
        db_user.skin = user.skin
        db_user.eyes = user.eyes
        db_user.pants = user.pants
        db_user.shoes = user.shoes
        db_user.hair_accessory = user.hair_accessory
        db.session.commit()

    except Exception as e:
        print("Failed to save user: %s" % user.username)
        print(e)
