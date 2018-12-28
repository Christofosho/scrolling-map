import json
from pathlib import Path

MAPS = {}
TILES = {}

RESOURCES = Path('app', 'resources')

with open(RESOURCES / 'maps.json') as m:
  MAPS = json.load(m)

with open(RESOURCES / 'tiles.json') as t:
  TILES = json.load(t)
