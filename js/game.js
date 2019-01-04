// game.js

// import '@babel/polyfill';
import {canvas, draw} from './draw';

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

/* MAP OPTIONS */
export let map = [];
export let action_data = {};
export let tile_buffer = 0; // Tile Buffer: How large tiles are

function determineClick(click_x, click_y) {
  const mid_offset = 15;
  const mid_width = canvas.width / 2;
  const mid_height = canvas.height / 2;
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

function getClickCoords(e) {
  e.preventDefault();
  const click_x = e.offsetX;
  const click_y = e.offsetY;
  determineClick(click_x, click_y);
}

function getTouchCoords(e) {
  e.preventDefault();
  const click_x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  const click_y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
  determineClick(click_x, click_y);
}

export function listener() {
  document.addEventListener('keydown', sendAction);
}

export function clickListener() {
  canvas.addEventListener('mousedown', getClickCoords);
  canvas.addEventListener('touchstart', getTouchCoords);
  canvas.addEventListener('touchend', function(e){e.preventDefault()});
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
    [user, [cx, cy, dir], map, [tile_buffer, sx, sy]] = data;
    if (canvas.width < 450) {
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
    data = JSON.parse(data);
    map = data
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
