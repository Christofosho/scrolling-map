import json
from pathlib import Path

MAPS = {}
ENTITIES = {}

RESOURCES = Path('app', 'resources')

with open(RESOURCES / 'maps.json') as m:
  MAPS = json.load(m)

with open(RESOURCES / 'entities.json') as t:
  ENTITIES = json.load(t)
