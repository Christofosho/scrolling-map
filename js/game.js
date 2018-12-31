// game.js

// import '@babel/polyfill';

/* Initializing */
const socket = io.connect('//' + document.domain + ':' + location.port);

let user = 0;

const canvas = document.getElementById('canvas');
canvas.addEventListener("contextmenu",
  function (e) {e.preventDefault();}, false);

const ctx = canvas.getContext('2d');

if (window.innerWidth < 500) {
  canvas.width = 270;
  canvas.height = 290;
}

const mid_width = canvas.width / 2;
const mid_height = canvas.height / 2;

let tile_buffer = 0; // Tile Buffer: How large tiles are

// character start (0,0)
let cx = 0;
let cy = 0;
let dir = 0;

let sx = 0;
let sy = 0;

const tilesheet = new Image();
tilesheet.src = "static/tilesheet.png";

const charsheet = new Image();
charsheet.src = "static/charsheet.png";

let map = [];

/* MAP OPTIONS */
let tiles = {};
let all_users = {};

/* DRAWING */
ctx.font = "11pt Verdana";
ctx.textAlign = "end";
const w = canvas.clientWidth;
const h = canvas.clientHeight - 20;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < w; x += tile_buffer) {
    const curr_x = x/tile_buffer+(cx-sx);
    for (let y = 0; y < h; y += tile_buffer) {
      const tile = map[y/tile_buffer+(cy-sy)][curr_x];
      if (Array.isArray(tile)) {
        for (const def in tile) {
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
  for (const u in all_users) {
    if (u != user) {
      const ucx = all_users[u]['cx'];
      const ucy = all_users[u]['cy'];
      const x = ucx - cx;
      const y = ucy - cy;
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
    32, 37, 38, 39, 40, 65, 68, 69, 83, 87
  ].includes(e.keyCode)) return;
  e.preventDefault();

  listener(); // Reset listeners.
  clickListener();

  if (e.keyCode == 32) { // Spacebar
    console.log("Eventually we will implement the spacebar for interacting"
      + " with items below your character.");
  }

  else if (e.keyCode == 69) {
    console.log("Eventually we will implement the 'e' key for interacting"
      + " with nearby npcs and objects, if your player is facing them!");
  }

  socket.emit('json', JSON.stringify({
    'user': user,
    'action': e.keyCode,
  }))
}

function determineClick(e) {
  const click_x = e.offsetX;
  const click_y = e.offsetY;

  const mid_offset = 15;
  const mid_low = mid_width - mid_offset;
  const mid_high = mid_width - mid_offset;
  if (polygon_click_test(4,
    [mid_low, mid_high, mid_high, mid_low], // x values
    [mid_low, mid_low, mid_high, mid_high], // y values
    click_x, click_y)) {
    sendAction({'keyCode': 32, 'preventDefault': function(){}}); // Spacebar
  }
  else if (polygon_click_test(3,
    [0, mid_width, canvas.width], [0, mid_height, 0],
    click_x, click_y)) {
    sendAction({'keyCode': 38, 'preventDefault': function(){}}); // Up
  }
  else if (polygon_click_test(3,
    [0, mid_width, canvas.width], [canvas.height, mid_height, canvas.height],
    click_x, click_y)) {
    sendAction({'keyCode': 40, 'preventDefault': function(){}}); // Down
  }
  else if (polygon_click_test(3,
    [0, mid_width, 0], [0, mid_height, canvas.height],
    click_x, click_y)) {
    sendAction({'keyCode': 37, 'preventDefault': function(){}}); // Left
  }
  else if (polygon_click_test(3,
    [canvas.width, mid_width, canvas.width], [0, mid_height, canvas.height],
    click_x, click_y)) {
    sendAction({'keyCode': 39, 'preventDefault': function(){}}); // Right
  }

  canvas.addEventListener('mouseup', clickListener);
  canvas.addEventListener('touchend', clickListener);
}

// polygon_click_test by Wm. Randolph Franklin
// int list(int) list(int) int int -> bool
// Consumes the number of vertices, along with each vertex coordinate,
// as a list of x coordinates and a second list of y coordinates.
// Tests against clicked coordinates to determine whether the
// click was within the polygon formed by said vertices.
function polygon_click_test( nvert, vertx, verty, testx, testy ) {
    let i, j, c = false;
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                c = !c;
        }
    }
    return c;
}

function doMove(movement) {
  cx = movement['cx'];
  cy = movement['cy'];
  dir = movement['direction'];
}

function listener() {
  document.removeEventListener('keydown', sendAction);
  document.addEventListener('keydown', sendAction);
}

function clickListener() {
  canvas.removeEventListener('mousedown', determineClick);
  canvas.removeEventListener('touchstart', determineClick);
  canvas.removeEventListener('mouseup', clickListener);
  canvas.removeEventListener('touchend', clickListener);
  canvas.addEventListener('mousedown', determineClick);
  canvas.addEventListener('touchstart', determineClick);
}

let last;
(function () {
  function main( timestamp ) {
    if (!last) {
      last = timestamp
      draw();
    }
    else {
      if (timestamp - last > 100) {
        draw();
      }
    }
    requestAnimationFrame( main );
  }

  socket.on('connect', function() {
    listener(); // Begin movement listeners
    clickListener();
  });

  // Recieves and populates initial data.
  socket.on('init_data', function (data) {
    data = JSON.parse(data);
    user = data[0];
    cx = data[1][0];
    cy = data[1][1];
    dir = data[1][2];
    map  = data[2]['map'];
    tile_buffer = data[3][0];
    if (canvas.width < 450) {
      sx = 4;
      sy = 4;
    }
    else {
      sx = data[3][1];
      sy = data[3][2];
    }
    main(); // Start the cycle
  });

  socket.on('tiles', function (data) {
    tiles = JSON.parse(data);
  });

  // Recieves and populates map data.
  socket.on('map_data', function (data) {
    data = JSON.parse(data);
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
