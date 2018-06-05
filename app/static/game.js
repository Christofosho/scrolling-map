/* INITIALIZING */
var socket = io.connect('//' + document.domain + ':' + location.port);

var user = 0;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var tb = 0; // Tile Buffer: How large tiles are

// character start (0,0)
var cx = old_cx = 0;
var cy = old_cy = 0;

var sx = 0;
var sy = 0;

var colour = "red";

var map = [];

/* MAP OPTIONS */
var colours = {
  0: "blue",
  1: "green"
};

var all_users = {};

/* DRAWING */
function draw() {
  if (!(old_cx == cx && old_cy == cy)) {
    for (x=0; x < canvas.clientWidth; x += tb) {
      var curr_x = x/tb+(cx-sx);
      var tb_x = x + tb;
      for (y=0; y < canvas.clientHeight; y += tb) {
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.fillStyle = colours[map[y/tb+(cy-sy)][curr_x]];
        ctx.fillRect(x, y, tb, tb);
        ctx.moveTo(x, y);
        ctx.lineTo(tb_x, y);
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + tb);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  drawOthers();

  // Fill the character tile (TEMP)
  ctx.fillStyle = colour;
  ctx.fillRect(sx*tb, sy*tb, tb, tb);
  ctx.strokeStyle = "white";
  ctx.strokeText("(" + cx + ", " + cy + ")", 3, 15);
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
        // Fill the character tile (TEMP)
        ctx.fillStyle = all_users[u]['colour'];
        ctx.fillRect((x+sx)*tb, (y+sy)*tb, tb, tb);
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
    'direction': e.keyCode,
  }))
}

function doMove(movement) {
  old_cx = cx;
  old_cy = cy;
  cx = movement['cx'];
  cy = movement['cy'];
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
    colour = data[2];
    map  = data[3]['map'];
    tb = data[3]['tb'];
    sx = data[3]['sx'];
    sy = data[3]['sy'];
    colours = data[4];
    main(); // Start the cycle
  });

  // Recieves and populates map data.
  socket.on('map_data', function (data) {
    data = JSON.parse(data);
    map  = data[0];
    colours = data[1];
  });

  // Moves the local player
  socket.on('movement_self', function (data) {
    data = JSON.parse(data);
    if (user == data['user'])
      doMove(data);
  });

  // Updates all players
  socket.on('update_all', function (data) {
    all_users = JSON.parse(data);
  });

  socket.on('failure', function (data) {
    console.log('Unsynchronized.');
  });
})();
