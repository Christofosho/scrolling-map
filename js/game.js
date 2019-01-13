// game.js

// import '@babel/polyfill';
import * as draw from './draw';
import * as settings from './settings';

/* Initializing */
const socket = io.connect('//' + document.domain + ':' + location.port);

export let user = "";
export let all_users = {};

// character start (0,0)
export let cx = 0;
export let cy = 0;
export let dir = 0;

export let border_size = 0;
export let last_click_x = -1;
export let last_click_y = -1;

/* MAP OPTIONS */
export let map = [];
export let entities = [];
export let action_data = {};
export let tile_buffer = 0; // Tile Buffer: How large tiles are

export let examine = "";
function resetExamine() {
  examine = "";
  draw.examine_menu_vertices = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];
}

export let object_name = "";
let hover_x = -1;
let hover_y = -1;

function determineLeftClick(click_x, click_y) {
  let canvas_width = draw.canvas.width - 60;
  let canvas_height = draw.canvas.height - 20;

  const mid_width = Math.floor(canvas_width / 2);
  const mid_height = Math.floor(canvas_height / 2);
  const mid_offset = Math.floor(tile_buffer / 2);
  const mid_low = mid_width - mid_offset;
  const mid_high = mid_width + mid_offset;

  resetExamine();

  // We divide this into "paged" checking
  // Return if we find a matching click, to avoid multiple
  // executions.

  // Settings scope
  if (draw.overlay == draw.OVERLAYS.Settings) {

    // Check if a setting is clicked. If so, send data to server.
    if (settings.handleClick(click_x, click_y, canvas_width, canvas_height)) {
      return;
    }
  }

  // Inventory scope
  else if (draw.overlay == draw.OVERLAYS.Inventory) {
    // Check for inventory interaction here.
  }

  // Map scope
  else if (draw.overlay == draw.OVERLAYS.None) {
    if (clickUnderTile(click_x, click_y, mid_low, mid_high)) {
      return;
    }

    if (clickCloseTile(click_x, click_y, mid_low, mid_high)) {
      return;
    }

    if (clickFarTile(click_x, click_y, canvas_width, canvas_height, mid_width, mid_height)) {
      return;
    }
  }

  // General scope
  if (checkMenuIconClicked(click_x, click_y, canvas_width)) {
    return;
  }

}

function checkMenuIconClicked(click_x, click_y, canvas_width) {
  // Click on settings menu
  if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [0, 0, 60, 60], /* y values */ click_x, click_y)) {
    draw.overlay = draw.overlay == draw.OVERLAYS.None ?
      draw.OVERLAYS.Settings : draw.OVERLAYS.None;
  }

  else if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [60, 60, 120, 120], /* y values */ click_x, click_y)) {
    draw.overlay = draw.overlay == draw.OVERLAYS.None ?
      draw.OVERLAYS.Inventory : draw.OVERLAYS.None;
  }
}

function clickUnderTile(click_x, click_y, mid_low, mid_high) {
  // Click on middle square (where player is standing)
  if (polygon_click_test(4,
    [mid_low, mid_high, mid_high, mid_low], // x values
    [mid_low, mid_low, mid_high, mid_high], // y values
    click_x, click_y)) {
    sendAction({'keyCode': 32, 'preventDefault': function(){}}); // Spacebar
    return true;
  }
  return false;
}

function clickCloseTile(click_x, click_y, mid_low, mid_high) {
  // Click on square directly above player location.
  if (polygon_click_test(4,
    [mid_low, mid_high, mid_high, mid_low], // x values
    [mid_low - tile_buffer, mid_low - tile_buffer, mid_low, mid_low], // y values
    click_x, click_y)) {
    if (dir == 1 && containsObject(cx, cy-1)) {
      sendAction({'keyCode': 69, 'preventDefault': function(){}}); // E
    }
    else {
      sendAction({'keyCode': 38, 'preventDefault': function(){}}); // Up
    }
    return true;
  }

  // Click on square one below player location.
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
    return true;
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
    return true;
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
    return true;
  }
  return false;
}

function clickFarTile(click_x, click_y, canvas_width, canvas_height, mid_width, mid_height) {

  /* Movement */
  if (polygon_click_test(3,
    [0, mid_width, canvas_width], [0, mid_height, 0],
    click_x, click_y)) { // Up
    sendAction({'keyCode': 38, 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [0, mid_width, canvas_width], [canvas_height, mid_height, canvas_height],
    click_x, click_y)) { // Down
    sendAction({'keyCode': 40, 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [0, mid_width, 0], [0, mid_height, canvas_height],
    click_x, click_y)) { // Left
    sendAction({'keyCode': 37, 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [canvas_width, mid_width, canvas_width], [0, mid_height, canvas_height],
    click_x, click_y)) { // Right
    sendAction({'keyCode': 39, 'preventDefault': function(){}});
    return true;
  }
  return false;
}

// polygon_click_test by Wm. Randolph Franklin
// int list(int) list(int) int int -> bool
// Consumes the number of vertices, along with each vertex coordinate,
// as a list of x coordinates and a second list of y coordinates.
// Tests against clicked coordinates to determine whether the
// click was within the polygon formed by said vertices.
export function polygon_click_test( nvert, vertx, verty, testx, testy ) {
    let i, j, c = false;
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
          c = !c;
        }
    }
    return c;
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
  let tile = getTile(last_click_x, last_click_y);
  if (Array.isArray(tile)) {
    let object = entities[tile[1]];
    if (object.type == "object") {
      examine = object.examine;
    }
  }
}

function getTile(x_, y_) {
  let click_x = Math.floor(x_ / 30);
  let click_y = Math.floor(y_ / 30);
  let tile_x = -1;
  let tile_y = -1;
  if (border_size > click_y) {
    tile_y = cy - (border_size - click_y);
  }
  else {
    tile_y = cy + (click_y - border_size);
  }

  if (border_size > click_x) {
    tile_x = cx - (border_size - click_x);
  }
  else {
    tile_x = cx + (click_x - border_size);
  }

  return map[tile_y][tile_x];
}

function handleMouseMovement(e) {
  e.preventDefault();
  let mouse_x = e.offsetX;
  let mouse_y = e.offsetY;

  // Mouse off right-click menu closes it (+- 5px)
  if (!polygon_click_test(4, [
    draw.examine_menu_vertices[0][0], draw.examine_menu_vertices[1][0],
    draw.examine_menu_vertices[2][0], draw.examine_menu_vertices[3][0]
  ], [
    draw.examine_menu_vertices[0][1], draw.examine_menu_vertices[1][1],
    draw.examine_menu_vertices[2][1], draw.examine_menu_vertices[3][1]
  ], mouse_x, mouse_y)) {
    resetExamine();
  }

  // Mouse over object shows text in corner
  let tile = getTile(mouse_x, mouse_y);
  if (Array.isArray(tile)) {
    let object = entities[tile[1]];
    if (object.type == "object" || object.type == "item") {
      object_name = object.name;
      hover_x = mouse_x;
      hover_y = mouse_y;
    }
  }
  else {
    object_name = "";
    hover_x = -1;
    hover_y = -1;
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
  draw.canvas.addEventListener("mousemove", handleMouseMovement);
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
    [user, [cx, cy, dir], map, entities, [tile_buffer, border_size]] = data;
    if (draw.canvas.width < 450) {
      border_size = 4;
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
