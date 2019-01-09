// game.js

// import '@babel/polyfill';
import * as draw from './draw';

/* Initializing */
const socket = io.connect('//' + document.domain + ':' + location.port);

export let user = "";
export let all_users = {};

// character start (0,0)
export let cx = 0;
export let cy = 0;
export let dir = 0;

export let sx = 0;
export let sy = 0;
export let last_click_x = -1;
export let last_click_y = -1;

/* MAP OPTIONS */
export let map = [];
export let entities = [];
export let options = [];
export let action_data = {};
export let tile_buffer = 0; // Tile Buffer: How large tiles are

function determineLeftClick(click_x, click_y) {
  let canvas_width = draw.canvas.width - 60;
  let canvas_height = draw.canvas.height - 20;
  if (click_x > canvas_width || click_y > canvas_height) {
    return;
  }

  const mid_offset = 15;
  const mid_width = Math.floor(canvas_width / 2);
  const mid_height = Math.floor(canvas_height / 2);
  const mid_low = mid_width - mid_offset;
  const mid_high = mid_width + mid_offset;

  // Click the right-click options menu
  if (polygon_click_test(4,
    [draw.option_menu_vertices[0][0], draw.option_menu_vertices[1][0],
    draw.option_menu_vertices[2][0], draw.option_menu_vertices[3][0]],
    [draw.option_menu_vertices[0][1], draw.option_menu_vertices[1][1],
    draw.option_menu_vertices[2][1], draw.option_menu_vertices[3][1]],
    click_x, click_y)) {
      handleOptionClicked(click_x, click_y);
  }

  else {

    // Reset options.
    options = [];
    draw.option_menu_vertices = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0]
    ];

    // Click on middle square (where player is standing)
    if (polygon_click_test(4,
      [mid_low, mid_high, mid_high, mid_low], // x values
      [mid_low, mid_low, mid_high, mid_high], // y values
      click_x, click_y)) {
      sendAction({'keyCode': 32, 'preventDefault': function(){}}); // Spacebar
    }

    // Click on square directly above player location.
    else if (polygon_click_test(4,
      [mid_low, mid_high, mid_high, mid_low], // x values
      [mid_low - tile_buffer, mid_low - tile_buffer, mid_low, mid_low], // y values
      click_x, click_y)) {
      if (dir == 1 && containsObject(cx, cy-1)) {
        sendAction({'keyCode': 69, 'preventDefault': function(){}}); // E
      }
      else {
        sendAction({'keyCode': 38, 'preventDefault': function(){}}); // Up
      }
    }

    // Click on square directly below player location.
    else if (polygon_click_test(4,
      [mid_low, mid_low, mid_high, mid_high], // x values
      [mid_high, mid_high + tile_buffer, mid_high + tile_buffer, mid_high], // y values
      click_x, click_y)) {
      if (dir == 0 && containsObject(cx, cy+1)) {
        sendAction({'keyCode': 69, 'preventDefault': function(){}}); // E
      }
      else {
        sendAction({'keyCode': 40, 'preventDefault': function(){}}); // Up
      }
    }

    // Click on square directly left player location.
    else if (polygon_click_test(4,
      [mid_low - tile_buffer, mid_low, mid_low, mid_low - tile_buffer], // x values
      [mid_low, mid_low, mid_high, mid_high], // y values
      click_x, click_y)) {
      if (dir == 3 && containsObject(cx-1, cy)) {
        sendAction({'keyCode': 69, 'preventDefault': function(){}}); // E
      }
      else {
        sendAction({'keyCode': 37, 'preventDefault': function(){}}); // Up
      }
    }

    // Click on square directly right player location.
    else if (polygon_click_test(4,
      [mid_high, mid_high + tile_buffer, mid_high + tile_buffer, mid_high], // x values
      [mid_low, mid_low, mid_high, mid_high], // y values
      click_x, click_y)) {
      if (dir == 2 && containsObject(cx+1, cy)) {
        sendAction({'keyCode': 69, 'preventDefault': function(){}}); // E
      }
      else {
        sendAction({'keyCode': 39, 'preventDefault': function(){}}); // Up
      }
    }

    else if (polygon_click_test(3,
      [0, mid_width, canvas_width], [0, mid_height, 0],
      click_x, click_y)) {
      sendAction({'keyCode': 38, 'preventDefault': function(){}}); // Up
    }
    else if (polygon_click_test(3,
      [0, mid_width, canvas_width], [canvas_height, mid_height, canvas_height],
      click_x, click_y)) {
      sendAction({'keyCode': 40, 'preventDefault': function(){}}); // Down
    }
    else if (polygon_click_test(3,
      [0, mid_width, 0], [0, mid_height, canvas_height],
      click_x, click_y)) {
      sendAction({'keyCode': 37, 'preventDefault': function(){}}); // Left
    }
    else if (polygon_click_test(3,
      [canvas_width, mid_width, canvas_width], [0, mid_height, canvas_height],
      click_x, click_y)) {
      sendAction({'keyCode': 39, 'preventDefault': function(){}}); // Right
    }
  }
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

function handleOptionClicked(click_x, click_y) {
  let omv = draw.option_menu_vertices;
  let total_height = omv[3][1] - omv[0][1];
  // First option clicked
  if (Math.floor(click_y / tile_buffer) < total_height / options.length) {
    console.log("First Item Clicked.");
  }
}

function setTouchCoords(e) {
  last_click_x = e.touches[0].clientX - draw.canvas.getBoundingClientRect().left;
  last_click_y = e.touches[0].clientY - draw.canvas.getBoundingClientRect().top;
}

function getClickCoords(e) {
  e.preventDefault();
  const click_x = e.offsetX;
  const click_y = e.offsetY;
  if (e.button == 2) {
    last_click_x = click_x;
    last_click_y = click_y;
    return;
  }
  determineLeftClick(click_x, click_y);
}

function getTouchCoords(e) {
  e.preventDefault();
  if (last_click_x > -1 || last_click_y > -1) {
    return;
  }
  const click_x = e.touches[0].clientX - draw.canvas.getBoundingClientRect().left;
  const click_y = e.touches[0].clientY - draw.canvas.getBoundingClientRect().top;
  determineLeftClick(click_x, click_y);
}

function setContextMenu(e) {
  e.preventDefault();
  let click_x = Math.floor(last_click_x / 30);
  let click_y = Math.floor(last_click_y / 30);
  let tile_x = -1;
  let tile_y = -1;
  if (sy > click_y) {
    tile_y = cy - (sy - click_y);
  }
  else {
    tile_y = cy + (click_y - sy);
  }

  if (sx > click_x) {
    tile_x = cx - (sx - click_x);
  }
  else {
    tile_x = cx + (click_x - sx);
  }
  
  let tile = map[tile_y][tile_x];
  options = [];
  console.log(tile_y, tile_x, tile);
  if (Array.isArray(tile)) {
    let object = entities[tile[1]];
    if (object.type == "object") {
      options.push("Examine");
    }
  }
}

export function listener() {
  document.addEventListener('keydown', sendAction);
}

export function clickListener() {
  draw.canvas.addEventListener('mousedown', getClickCoords);
  draw.canvas.addEventListener('touchstart', setTouchCoords);
  draw.canvas.addEventListener('touchend', getTouchCoords);
  draw.canvas.addEventListener("contextmenu", setContextMenu);
}

// Check if the tile at (x_, y_) has an object.
function containsObject(x_, y_) {
  if (Array.isArray(map[y_][x_])) {
    if (entities[map[y_][x_][1]].type == "object") {
      return true;
    }
  }
  return false;
}

/* MOVEMENT */
function sendAction(e) {
  if (![
    32, 37, 38, 39, 40, 65, 68, 69, 83, 87
  ].includes(e.keyCode)) return;
  e.preventDefault();

  if (e.keyCode == 32) { // Spacebar
    console.log("Eventually we will implement the spacebar for interacting"
      + " with items below your character.");
  }

  socket.emit('json', JSON.stringify({
    'username': user,
    'action': e.keyCode,
  }))
}

function doMove(movement) {
  cx = movement.cx;
  cy = movement.cy;
  dir = movement.direction;
}

let last;
(function () {
  function main( timestamp ) {
    if (!last) {
      last = timestamp
      draw.draw();
    }
    else {
      if (timestamp - last > 100) {
        draw.draw();
      }
    }
    requestAnimationFrame( main );
  }

  socket.on('connect', function() {
    const form = document.getElementById("authentication");
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      socket.emit('authentication', JSON.stringify({
        'username': document.getElementById('username').value
      }));
    });
  });

  socket.on('authenticated', function(data) {
    data = JSON.parse(data);
    const msg = document.getElementById("message");
    if (data.success) {
      msg.innerHTML = "Authenticated successfully!";
      setTimeout(function() {
        msg.innerHTML = "Loading data...";
        socket.emit('retrieve_init_data', JSON.stringify({
          'username': data.username
        }));
      }, 600);
    }
    else {
      msg.innerHTML = "Authentication failed. Please try again.";
    }
  });

  function loadMap(attempts) {
    const loaded = checkDataAcquired();
    const msg = document.getElementById("message");
    if (loaded) {
      setTimeout(function() {
        document.getElementById('auth').className = "hide";
        document.querySelector('main').className = "show";
        msg.innerHTML = "Welcome to the world.";
        main(); // Start the cycle
        listener(); // Begin movement listeners
        clickListener();
      }, 1000);
      return; // Do not execute the rest of the function.
    }
    attempts++;
    if (attempts < 10) {
      setTimeout(function(){
        loadMap(attempts);
      }, 100);
      return; // Do not execute the rest of the function.
    }

    msg.innerHTML = "Failed to get data from the server.";
  }

  function checkDataAcquired() {
    const got_user = user !== "";
    const got_map = map !== undefined || map.length > 0;
    return got_user && got_map;
  }

  // Recieves and populates initial data.
  socket.on('init_data', function (data) {
    data = JSON.parse(data);
    [user, [cx, cy, dir], map, entities, [tile_buffer, sx, sy]] = data;
    if (draw.canvas.width < 450) {
      sx = 4;
      sy = 4;
    }
    loadMap(0);
  });

  socket.on('object_action', function (data) {
    action_data = JSON.parse(data);
  });

  // Recieves and populates map data.
  socket.on('map_data', function (data) {
    map = JSON.parse(data);
  });

  socket.on('entity_data', function (data) {
    entities = JSON.parse(data);
  });

  // Moves the local player
  socket.on('movement_self', function (data) {
    data = JSON.parse(data);
    if (user == data.username)
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
