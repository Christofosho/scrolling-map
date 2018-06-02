import json, uuid
from flask import request, render_template
from flask_socketio import send, emit

from app import app, socketio

MAPS = {'default': {
  'map': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ], 'ex': 9, 'ey': 9,
  'noWalk': [0]}
}

COMMANDS = (
  37,
  38,
  39,
  40,
  65,
  68,
  83,
  87
)

users = {}

@app.route("/", methods=['GET'])
def index():

  return render_template('index.html')

@socketio.on('connect')
def connect():
  user = request.sid
  users[user] = {
    'mapId': 'default',
    'cx': 0,
    'cy': 0
  }

  data = [
    user,
    {k:v for k,v in MAPS['default'].items() if k in ('map')}
  ]

  print ("User " + user + " has connected.")

  emit('map_data', json.dumps(data), room=request.sid)

@socketio.on('disconnect')
def disconnect():
  users.pop(request.sid)

@socketio.on('json')
def move(data):
  data = json.loads(data)

  direction = data['direction']
  if direction not in COMMANDS:
    return

  user = users.get(data['user'])
  if not user:
    return

  cx = curr_cx = user.get('cx')
  cy = curr_cy = user.get('cy')
  map_data = MAPS.get(user.get('mapId'))
  curr_map = map_data['map']
  ex = map_data['ex']
  ey = map_data['ey']
  noWalkTiles = map_data['noWalk']

  cx, cy = checkDirection(direction, cx, cy, ex, ey)

  if (curr_map[cy+4][cx+4] not in noWalkTiles
      and (cx != curr_cx or cy != curr_cy)):
    users[data['user']]['cx'] = cx
    users[data['user']]['cy'] = cy
    emit('movement_self', json.dumps({
      'user': data['user'],
      'cx': cx,
      'cy': cy
    }), room=request.sid)

  socketio.emit('update_all', json.dumps(users))

### Helpers
def checkDirection(direction, cx, cy, ex, ey):
  # Left
  if direction in (37, 65):
    if cx > 0: # Boundary check
      cx -= 1

  # Right
  elif direction in (39, 68):
    if cx < ex: # Boundary check
      cx += 1

  # Down
  elif direction in (40, 83):
    if cy < ey: # Boundary check
      cy += 1

  # Up
  elif direction in (38, 87):
    if cy > 0: # Boundary check
      cy -= 1

  return cx, cy


app.secret_key = 'fake'
