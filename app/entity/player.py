### player.py

class Player:

  def __init__(self, player_id, username, x, y, map_id, shirt, current_sid, settings, direction=0, last_action=0, bag=[]):
    self.uid = player_id
    self.username = username
    self.x = x
    self.y = y
    self.map_id = map_id
    self.shirt = shirt
    self.current_sid = current_sid
    self.settings = settings
    self.direction = direction
    self.last_action = last_action
    self.bag = bag
