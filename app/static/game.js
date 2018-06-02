/* INITIALIZING */
var server = 1; // is connected to server
var DEBUG = 0;

if (server)
  var socket = io.connect('//' + document.domain + ':' + location.port);

var user = 0;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var tb = 50; // Tile Buffer: How large tiles are

// character start (0,0)
var cx = 0;
var cy = 0;

var map = [];

/* MAP OPTIONS */
var colours = {
  0:"blue",
  1:"green"
};

var all_users = {};

/* DRAWING */
function draw() {
  for (x=0; x < canvas.clientWidth; x += tb) {
    for (y=0; y < canvas.clientHeight; y += tb) {
      ctx.beginPath();
      ctx.fillStyle = colours[map[y/tb+cy][x/tb+cx]];
      ctx.fillRect(x, y, tb, tb);
      ctx.moveTo(x, y);
      ctx.lineTo(x + tb, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + tb);
      ctx.stroke();
      ctx.closePath();
    }
  }

  drawOthers();

  // Fill the character tile (TEMP)
  ctx.fillStyle = "red";
  ctx.fillRect(4*tb, 4*tb, tb, tb);
}

function drawOthers() {
  var i = 0;
  for (u in all_users) {
    if (u != user) {
      ucx = all_users[u]['cx'];
      ucy = all_users[u]['cy'];
      x = ucx - cx;
      y = ucy - cy;
      if (x >= -4 && x <= 4 && y >= -4 && y <= 4) {
        // Fill the character tile (TEMP)
        ctx.fillStyle = "red";
        ctx.fillRect((x+4)*tb, (y+4)*tb, tb, tb);
      }
    }
  }
}

/* MOVEMENT */
function sendAction(e) {
  if (![
    37, 38, 39, 40, 65, 68, 83, 87
  ].includes(e.keyCode)) return;
  e.preventDefault();

  listener(); // Reset listener.

  if (server) {
    socket.emit('json', JSON.stringify({
      'user': user,
      'direction': e.keyCode,
    }))
  }
  else {
    doMove(e);
  }
}

function doMove(movement) {
  cx = movement['cx'];
  cy = movement['cy'];
}

function listener() {
  document.removeEventListener('keydown', sendAction);
  document.addEventListener('keydown', sendAction);
}

var stop_var;
(function () {
  function main( tFrame ) {
    stop_var = window.requestAnimationFrame( main );
    draw();
  }

  if (server) { // Server listeners

    socket.on('connect', function() {
      socket.emit('map_data', JSON.stringify(user));
      if (DEBUG) console.log('Beginning listener..')
      listener(); // Begin movement listener
    });

    // Recieves and populates map data.
    socket.on('map_data', function (data) {
      if (DEBUG) console.log('Got map data!');
      data = JSON.parse(data);
      user = data[0];
      map  = data[1]['map'];
      if (DEBUG) console.log('Executing main..');
      main(); // Start the cycle
    });

    // Moves the local player
    socket.on('movement_self', function (data) {
      data = JSON.parse(data);
      if (user == data['user'])
        if (DEBUG) console.log('Attempting move..');
        doMove(data);
    });

    // Updates all players
    socket.on('update_all', function (data) {
      data = JSON.parse(data);
      all_users = data;
    });

    socket.on('failure', function (data) {
      console.log('Unsynchronized.');
    });
  }
})();
