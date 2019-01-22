// settings.js

import {canvas} from './draw';
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
    [55, 50, 75, 75], /* y values */ click_x, click_y)) {
    settings.player_names = !settings.player_names;
    sendSettings();
    return true;
  }

  // Show current coordinates
  else if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [75, 75, 100, 100], /* y values */ click_x, click_y)) {
    settings.coordinates = !settings.coordinates;
    sendSettings();
    return true;
  }

  // Show current coordinates
  else if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [100, 100, 125, 125], /* y values */ click_x, click_y)) {
    settings.zoom = !settings.zoom;
    if (settings.zoom) {
      canvas.getContext('2d').imageSmoothingEnabled = false;
      if (window.innerWidth < 600 || window.innerHeight < 600) {
        canvas.width = 330;
        canvas.height = 290;
      }
      else {
        canvas.width = 480;
        canvas.height = 440;
      }
    }
    else {
      if (window.innerWidth < 600 || window.innerHeight < 600) {
        canvas.width = 330;
        canvas.height = 290;
      }
      else {
        canvas.width = 510;
        canvas.height = 470;
      }
    }

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