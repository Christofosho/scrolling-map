// map.js
// Handles map manipulation logic.
import * as game from './game';
import * as player from './player';

export let border_size = 0; // How many tiles from edge to player
export let tile_buffer = 0; // Tile Buffer: How large tiles are

export function getTile(x_, y_) {
  let click_x = Math.floor(x_ / 30);
  let click_y = Math.floor(y_ / 30);
  let tile_x = -1;
  let tile_y = -1;
  if (border_size > click_y) {
    tile_y = player.cy - (border_size - click_y);
  }
  else {
    tile_y = player.cy + (click_y - border_size);
  }

  if (border_size > click_x) {
    tile_x = player.cx - (border_size - click_x);
  }
  else {
    tile_x = player.cx + (click_x - border_size);
  }

  return player.current_map[tile_y][tile_x];
}

// Check if the tile at (x_, y_) has an object.
export function containsObject(x_, y_) {
  if (Array.isArray(player.current_map[y_][x_])) {
    if (game.entities[player.current_map[y_][x_][1]].type == "object") {
      return true;
    }
  }
  return false;
}