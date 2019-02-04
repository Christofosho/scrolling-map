class Player:
    def __init__(self, player_id, username, x, y, map_id,
                 shirt, hair, skin, eyes, pants, shoes, hair_accessory,
                 current_sid, settings, direction=0, last_action=0, bag=[]):
        self.uid = player_id
        self.username = username
        self.x = x
        self.y = y
        self.map_id = map_id
        self.shirt = shirt
        self.hair = hair
        self.skin = skin
        self.eyes = eyes
        self.pants = pants
        self.shoes = shoes
        self.hair_accessory = hair_accessory
        self.current_sid = current_sid
        self.settings = settings
        self.direction = direction
        self.last_action = last_action
        self.bag = bag

    def getAllData(self):
        return {
            'username': self.username,
            'cx': self.x,
            'cy': self.y,
            'direction': self.direction,
            'shirt': self.shirt,
            'hair': self.hair,
            'skin': self.skin,
            'eyes': self.eyes,
            'pants': self.pants,
            'shoes': self.shoes,
            'hair_accessory': self.hair_accessory
        }
