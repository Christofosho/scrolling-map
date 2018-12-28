/* INITIALIZING */
var socket = io.connect('//' + document.domain + ':' + location.port);

var user = 0;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var tile_buffer = 0; // Tile Buffer: How large tiles are

// character start (0,0)
var cx = old_cx = 0;
var cy = old_cy = 0;
var dir = old_dir = 0;

var sx = 0;
var sy = 0;

var tilesheet = new Image();
tilesheet.src = "static/tilesheet.png";

var charsheet = new Image();
charsheet.src = "static/charsheet.png";

var map = [];

/* MAP OPTIONS */
var tiles = {};
var all_users = {};

/* DRAWING */
ctx.font = "11pt Verdana";
ctx.textAlign = "end";
var w = canvas.clientWidth;
var h = canvas.clientHeight - 20;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (x=0; x < w; x += tile_buffer) {
    var curr_x = x/tile_buffer+(cx-sx);
    for (y=0; y < h; y += tile_buffer) {
      tile = map[y/tile_buffer+(cy-sy)][curr_x];
      if (Array.isArray(tile)) {
        for (var def in tile) {
          drawTile(tile[def], x, y);
        }
      }
      else {
        drawTile(tile, x, y);
      }
    }
  }

  drawOthers();

  // Fill the local character tile
  if (charsheet.complete) {
    drawPlayer(sx, sy, dir);
  }
  else {
    charsheet.addEventListener('load', drawPlayer);
  }

  // Fill the position
  ctx.fillStyle = "white";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
  ctx.strokeText(
    "(" + cx + ", " + cy + ")",
    14*tile_buffer+30, 15*tile_buffer+15
  );
}

function drawTile(tile, x, y) {
  ctx.beginPath();
  if (tilesheet.complete) {
    drawImage(tile, x, y);
  }
  else {
    tilesheet.load = drawImage.bind(tile, x, y);
  }
  ctx.moveTo(x, y);
  ctx.lineTo(x + tile_buffer, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + tile_buffer);
  ctx.stroke();
  ctx.closePath();
}

function drawPlayer(x_, y_, direction) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(charsheet, direction * tile_buffer, 0,
    tile_buffer, tile_buffer, x_*tile_buffer, y_*tile_buffer, tile_buffer, tile_buffer)
}

function drawImage(tile, x, y) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(tilesheet, (tile % 10) * tile_buffer, Math.floor(tile / 10) * tile_buffer,
    tile_buffer, tile_buffer, x, y, tile_buffer, tile_buffer);
}

function drawOthers() {
  var i = 0;
  for (u in all_users) {
    if (u != user) {
      ucx = all_users[u]['cx'];
      ucy = all_users[u]['cy'];
      x = ucx - cx;
      y = ucy - cy;
      if (x >= -sx && x <= sx && y >= -sy && y <= sy) {
        // Fill the character tile
        drawPlayer(x+sx, y+sy, all_users[u]['direction'])
      }
    }
  }
}


/* MOVEMENT */
function sendAction(e) {
  if (![
    32, 37, 38, 39, 40, 65, 68, 83, 87
  ].includes(e.keyCode)) return;
  e.preventDefault();

  listener(); // Reset listener.

  socket.emit('json', JSON.stringify({
    'user': user,
    'action': e.keyCode,
  }))
}

function doMove(movement) {
  old_cx = cx;
  old_cy = cy;
  old_dir = dir;
  cx = movement['cx'];
  cy = movement['cy'];
  dir = movement['direction'];
}

function listener() {
  document.removeEventListener('keydown', sendAction);
  document.addEventListener('keydown', sendAction);
}

var stop_var;
(function () {
  function main( timestamp ) {
    if (!last) {
      var last = timestamp
      draw();
    }
    else {
      if (timestamp - start > 100) {
        draw();
      }
    }
    stop_var = requestAnimationFrame( main );
  }

  socket.on('connect', function() {
    listener(); // Begin movement listener
  });

  // Recieves and populates initial data.
  socket.on('init_data', function (data) {
    data = JSON.parse(data);
    user = data[0];
    cx = data[1][0];
    cy = data[1][1];
    dir = data[1][2];
    colour = data[2];
    map  = data[3]['map'];
    tile_buffer = data[4][0];
    sx = data[4][1];
    sy = data[4][2];
    main(); // Start the cycle
  });

  socket.on('tiles', function (data) {
    tiles = JSON.parse(data);
  });

  // Recieves and populates map data.
  socket.on('map_data', function (data) {
    data = JSON.parse(data);
    map[data[1]][data[0]]  = data[2];
  });

  // Moves the local player
  socket.on('movement_self', function (data) {
    data = JSON.parse(data);
    if (user == data['user'])
      doMove(data);
  });

  // Updates all players
  socket.on('update_all', function (data) {
    console.log(data);
    all_users = JSON.parse(data);
  });

  socket.on('failure', function (data) {
    console.log('Unsynchronized.');
  });
})();
