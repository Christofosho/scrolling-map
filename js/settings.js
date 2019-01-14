// settings.js

import * as game from './game';

export let settings = {
  player_names: true,
  coordinates: false
}

export function handleClick(click_x, click_y, canvas_width, canvas_height) {
  const quarter_width = canvas_width / 4;
  if (game.polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [50, 50, 72, 72], /* y values */ click_x, click_y)) {
    settings.player_names = !settings.player_names;
    game.socket.emit('settings', JSON.stringify({
      'username': game.user,
      'settings': settings,
    }));
    return true;
  }

  else if (game.polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [73, 73, 95, 95], /* y values */ click_x, click_y)) {
    settings.coordinates = !settings.coordinates;
    game.socket.emit('settings', JSON.stringify({
      'username': game.user,
      'settings': settings,
    }));
    return true;
  }
  return false;
}