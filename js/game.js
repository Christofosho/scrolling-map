// game.js

// import '@babel/polyfill';
import * as draw from './draw';
import * as settings from './settings';
import * as player from './player';
import * as input from './input';
import * as map from './map';

/* Initializing */
export const socket = io.connect('//' + document.domain + ':' + location.port);

export let all_users = {};

export let entities = [];
export let action_data = {};

export let examine = "";
export function resetExamine() {
  examine = "";
  draw.examine_menu_vertices = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ];
}

export let object_name = "";

/* Movement */
function doMove(movement) {
  player.cx = movement.cx;
  player.cy = movement.cy;
  player.dir = movement.direction;
}

/* Main game loop and socket listeners */
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
    if (loaded) {
      setTimeout(function() {
        document.getElementById('message').className = "hide";
        document.getElementById('auth').className = "hide";
        document.getElementById('canvas').className = "show centered";
        main(); // Start the cycle
        input.listener(); // Begin movement listeners
        input.clickListener();
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
    const got_user = player.username !== "";
    const got_map = player.current_map !== undefined || player.current_map.length > 0;
    return got_user && got_map;
  }

  // Recieves and populates initial data.
  socket.on('init_data', function (data) {
    data = JSON.parse(data);
    [player.username, [player.cx, player.cy, player.dir],
      [player.current_map, player.current_map_name],
      player.shirt, player.hair, entities, settings.settings,
      [map.tile_buffer, map.border_size]
    ] = data;
    if (draw.canvas.width < 450) {
      map.border_size = 4;
    }
    loadMap(0);
  });

  socket.on('object_action', function (data) {
    action_data = JSON.parse(data);
  });

  // Recieves and populates map data.
  socket.on('map_data', function (data) {
    [player.current_map, player.current_map_name] = JSON.parse(data);
  });

  socket.on('entity_data', function (data) {
    entities = JSON.parse(data);
  });

  // Moves the local player
  socket.on('movement_self', function (data) {
    data = JSON.parse(data);
    if (player.username == data.username)
      doMove(data);
  });

  // Updates all players
  socket.on('update_all', function (data) {
    data = JSON.parse(data);
    if (data.username == player.username) {
      player.shirt = data.shirt;
      player.hair = data.hair;
    }
    else {
      all_users[data.username] = data;
    }
  });

  // Remove player from users data
  socket.on('remove_user', function (data) {
    data = JSON.parse(data);
    if (data.username) {
      delete all_users[data.username];
    }
  });

  socket.on('failure', function (data) {
    console.log('Unsynchronized.');
  });
})();
