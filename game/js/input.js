// input.js
// Handles user input.

import * as draw from './draw';
import * as game from './game';
import * as map from './map';
import * as player from './player';
import * as settings from './settings';

export let last_click_x = -1;
export let last_click_y = -1;

let last_click_time = Date.now();

function sendAction(e) {
  if (![
    "Space", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "KeyA", "KeyD", "KeyE", "KeyS", "KeyW"
  ].includes(e.code)) return;
  e.preventDefault();

  if (last_click_time >= Date.now() - 300) {
    return; // 300ms delay on clicks
  }
  last_click_time = Date.now()

  if (e.code == "Space") { // Spacebar
    console.log("Eventually we will implement the spacebar for interacting"
      + " with items below your character.");
  }

  game.socket.emit('json', JSON.stringify({
    'username': player.username,
    'action': e.code,
  }))
}

function determineLeftClick(click_x, click_y) {
  let canvas_width = draw.canvas.width - 60;
  let canvas_height = draw.canvas.height - 20;

  const mid_width = Math.floor(canvas_width / 2);
  const mid_height = Math.floor(canvas_height / 2);
  const mid_offset = Math.floor(map.tile_buffer / 2);
  const mid_low = mid_width - mid_offset;
  const mid_high = mid_width + mid_offset;

  game.resetExamine();

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

  // Message History Scope
  else if (draw.overlay == draw.OVERLAYS.History) {
    // Check for message history interaction.
  }

  // Inventory scope
  else if (draw.overlay == draw.OVERLAYS.Inventory) {
    // Check for inventory interaction.
  }

  // Map scope
  else if (draw.overlay == draw.OVERLAYS.None) {
    if (clickUnderTile(click_x, click_y, mid_low, mid_high)) {
      return;
    }

    if (clickAdjacentTile(click_x, click_y, mid_low, mid_high)) {
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
  // Click on settings menu icon
  if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [0, 0, 59, 59], /* y values */ click_x, click_y)) {
    draw.overlay = draw.overlay != draw.OVERLAYS.Settings ?
      draw.OVERLAYS.Settings : draw.OVERLAYS.None;
  }

  // Click message history icon
  else if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [60, 60, 119, 119], /* y values */ click_x, click_y)) {
    draw.overlay = draw.overlay != draw.OVERLAYS.Inventory ?
      draw.OVERLAYS.Inventory : draw.OVERLAYS.None;
  }

  // Click inventory icon
  else if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [120, 120, 179, 179], /* y values */ click_x, click_y)) {
    draw.overlay = draw.overlay != draw.OVERLAYS.History ?
      draw.OVERLAYS.History : draw.OVERLAYS.None;
  }

  // Click logout icon
  else if (polygon_click_test(4,
    [canvas_width, canvas.width, canvas.width, canvas_width], // x values
    [canvas.height - 30, canvas.height - 30, canvas.height, canvas.height], /* y values */ click_x, click_y)) {
    game.socket.emit('logout');
  }
}

function clickUnderTile(click_x, click_y, mid_low, mid_high) {
  // Click on middle square (where player is standing)
  if (polygon_click_test(4,
    [mid_low, mid_high, mid_high, mid_low], // x values
    [mid_low, mid_low, mid_high, mid_high], // y values
    click_x, click_y)) {
    sendAction({'code': "Space", 'preventDefault': function(){}});
    return true;
  }
  return false;
}

function clickAdjacentTile(click_x, click_y, mid_low, mid_high) {
  // Click on square directly above player location.
  if (polygon_click_test(4,
    [mid_low, mid_high, mid_high, mid_low], // x values
    [mid_low - map.tile_buffer, mid_low - map.tile_buffer, mid_low, mid_low], // y values
    click_x, click_y)) {
    if (player.direction == 1 && map.containsObject(player.cx, player.cy-1)) {
      sendAction({'code': "KeyE", 'preventDefault': function(){}});
    }
    else {
      sendAction({'code': "ArrowUp", 'preventDefault': function(){}});
    }
    return true;
  }

  // Click on square one below player location.
  else if (polygon_click_test(4,
    [mid_low, mid_low, mid_high, mid_high], // x values
    [mid_high, mid_high + map.tile_buffer, mid_high + map.tile_buffer, mid_high], // y values
    click_x, click_y)) {
    if (player.direction == 0 && map.containsObject(player.cx, player.cy+1)) {
      sendAction({'code': "KeyE", 'preventDefault': function(){}});
    }
    else {
      sendAction({'code': "ArrowDown", 'preventDefault': function(){}});
    }
    return true;
  }

  // Click on square directly left player location.
  else if (polygon_click_test(4,
    [mid_low - map.tile_buffer, mid_low, mid_low, mid_low - map.tile_buffer], // x values
    [mid_low, mid_low, mid_high, mid_high], // y values
    click_x, click_y)) {
    if (player.direction == 3 && map.containsObject(player.cx-1, player.cy)) {
      sendAction({'code': "KeyE", 'preventDefault': function(){}});
    }
    else {
      sendAction({'code': "ArrowLeft", 'preventDefault': function(){}});
    }
    return true;
  }

  // Click on square directly right player location.
  else if (polygon_click_test(4,
    [mid_high, mid_high + map.tile_buffer, mid_high + map.tile_buffer, mid_high], // x values
    [mid_low, mid_low, mid_high, mid_high], // y values
    click_x, click_y)) {
    if (player.direction == 2 && map.containsObject(player.cx+1, player.cy)) {
      sendAction({'code': "KeyE", 'preventDefault': function(){}});
    }
    else {
      sendAction({'code': "ArrowRight", 'preventDefault': function(){}});
    }
    return true;
  }
  return false;
}

function clickFarTile(click_x, click_y, canvas_width, canvas_height, mid_width, mid_height) {

  /* Movement */
  if (polygon_click_test(3,
    [0, mid_width, canvas_width], [0, mid_height, 0],
    click_x, click_y)) {
    sendAction({'code': "ArrowUp", 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [0, mid_width, canvas_width], [canvas_height, mid_height, canvas_height],
    click_x, click_y)) {
    sendAction({'code': "ArrowDown", 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [0, mid_width, 0], [0, mid_height, canvas_height],
    click_x, click_y)) {
    sendAction({'code': "ArrowLeft", 'preventDefault': function(){}});
    return true;
  }
  else if (polygon_click_test(3,
    [canvas_width, mid_width, canvas_width], [0, mid_height, canvas_height],
    click_x, click_y)) {
    sendAction({'code': "ArrowRight", 'preventDefault': function(){}});
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
  e.preventDefault();
  e.stopPropagation();
  last_click_x = e.touches[0].clientX - draw.canvas.getBoundingClientRect().left;
  last_click_y = e.touches[0].clientY - draw.canvas.getBoundingClientRect().top;
}

function getClickCoords(e) {
  e.preventDefault();
  if (last_click_x > -1 || last_click_y > -1) {
    last_click_x = 0;
    last_click_y = 0;
    return;
  }
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
  determineLeftClick(last_click_x, last_click_y);
}

function setContextMenu(e) {
  e.preventDefault();
  let tile = map.getTile(last_click_x, last_click_y);
  if (Array.isArray(tile)) {
    let object = game.entities[tile[1]];
    if (object.type == "object") {
      game.examine = object.examine;
    }
  }
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
    game.resetExamine();
  }

  // Mouse over object shows text in corner
  let tile = map.getTile(mouse_x, mouse_y);
  if (Array.isArray(tile)) {
    let object = game.entities[tile[1]];
    if (object.type == "object" || object.type == "item") {
      game.object_name = object.name;
    }
  }
  else {
    game.object_name = "";
  }
}

export function listener() {
  document.addEventListener('keydown', sendAction);
}

export function clickListener() {
  draw.canvas.addEventListener('mousedown', getClickCoords);
  draw.canvas.addEventListener('touchstart', setTouchCoords, { passive: false });
  draw.canvas.addEventListener('touchend', getTouchCoords, { passive: false });
  draw.canvas.addEventListener('contextmenu', setContextMenu);
  draw.canvas.addEventListener('mousemove', handleMouseMovement);
}

export function removeListeners() {
  document.removeEventListener('keydown', sendAction);
  draw.canvas.removeEventListener('mousedown', getClickCoords);
  draw.canvas.removeEventListener('touchstart', setTouchCoords, { passive: false });
  draw.canvas.removeEventListener('touchend', getTouchCoords, { passive: false });
  draw.canvas.removeEventListener('contextmenu', setContextMenu);
  draw.canvas.removeEventListener('mousemove', handleMouseMovement);
}