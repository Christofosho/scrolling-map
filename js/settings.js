// settings.js

import {socket} from './game';
import {username} from './player';
import {polygon_click_test} from './input';

export let settings = {
  player_names: true,
  coordinates: false,
  zoom: false
}

export function handleClick(click_x, click_y, canvas_width, canvas_height) {
  const quarter_width = canvas_width / 4 - 20;

  // Show player names
  if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [50, 50, 72, 72], /* y values */ click_x, click_y)) {
    settings.player_names = !settings.player_names;
    sendSettings();
    return true;
  }

  // Show current coordinates
  else if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [73, 73, 95, 95], /* y values */ click_x, click_y)) {
    settings.coordinates = !settings.coordinates;
    sendSettings();
    return true;
  }

  // Zoom canvas
  else if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [96, 96, 128, 128], /* y values */ click_x, click_y)) {
    settings.zoom = !settings.zoom;
    sendSettings();
    return true;
  }

  return false;
}

function sendSettings() {
  socket.emit('settings', JSON.stringify({
    'username': username,
    'settings': settings,
  }));
}