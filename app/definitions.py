import json
from pathlib import Path

MAPS = {}
ENTITIES = {}
PORTALS = {}

RESOURCES = Path('app', 'resources')

with open(RESOURCES / 'maps.json') as m:
    MAPS = json.load(m)

with open(RESOURCES / 'entities.json') as t:
    ENTITIES = json.load(t)

with open(RESOURCES / 'portals.json') as p:
    PORTALS = json.load(p)
