import json
import os
current_directory = os.path.dirname(__file__)

MAPS = {}
TILES = {}

with open(current_directory + '\\resources\\maps.json') as m:
  MAPS = json.load(m)

with open(current_directory + '\\resources\\tiles.json') as t:
  TILES = json.load(t)
