import json, uuid, random
from flask import request, render_template
from flask_socketio import send, emit

from app import app, socketio

from app.maps import MAPS

COMMANDS = (
  32,
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
defaultx = 7
defaulty = 7

current_map = dict(MAPS['default']) # Take a copy

colours = {
  0: "blue",
  1: "green"
}

@app.route("/", methods=['GET'])
def index():

  return render_template('index.html')

@socketio.on('connect')
def connect():
  user = request.sid

  r = lambda: random.randint(0, 255)
  colour = '#%02X%02X%02X' % (r(),r(),r())
  colours[user] = colour

  users[user] = {
    'mapId': 'default',
    'colour': colour,
    'cx': defaultx,
    'cy': defaulty
  }

  data = [
    user,
    [defaultx, defaulty],
    colour,
    current_map
  ]

  print ("User " + user + " has connected.")

  emit('init_data', json.dumps(data), room=request.sid)
  socketio.emit('update_all', json.dumps(users))
  socketio.emit('colours', json.dumps(colours))

@socketio.on('disconnect')
def disconnect():
  users.pop(request.sid, 0)
  socketio.emit('update_all', json.dumps(users))

@socketio.on('json')
def move(data):
  data = json.loads(data)

  user = users.get(data['user'])
  if not user or (data['user'] != request.sid):
    return disconnect()

  direction = data['direction']
  if direction not in COMMANDS:
    return

  if direction == 32: # Spacebar
    cx = curr_cx = user.get('cx')
    cy = curr_cy = user.get('cy')
    current_map['map'][cy][cx] = data['user']
    map_data = [cx, cy, data['user']]
    socketio.emit('map_data', json.dumps(map_data))

  else:
    cx = curr_cx = user.get('cx')
    cy = curr_cy = user.get('cy')
    map_data = MAPS.get(user.get('mapId'))
    curr_map = map_data['map']
    sx = map_data['sx']
    sy = map_data['sy']
    ex = map_data['ex']
    ey = map_data['ey']
    noWalkTiles = map_data['noWalk']

    cx, cy = checkDirection(direction, cx, cy, sx, sy, ex, ey)

    if (curr_map[cy][cx] not in noWalkTiles
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
def checkDirection(direction, cx, cy, sx, sy, ex, ey):
  # Left
  if direction in (37, 65):
    if cx > sx: # Boundary check
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
    if cy > sy: # Boundary check
      cy -= 1

  return cx, cy


app.secret_key = 'fake'
