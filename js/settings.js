// settings.js

import {polygon_click_test} from './game';

export let settings = {
  player_names: true,
  coordinates: false
}

export function handleClick(click_x, click_y, canvas_width, canvas_height) {
  const quarter_width = canvas_width / 4;
  if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [50, 50, 72, 72], /* y values */ click_x, click_y)) {
    settings.player_names = !settings.player_names;
    return true;
  }

  else if (polygon_click_test(4,
    [quarter_width, quarter_width*3, quarter_width*3, quarter_width], // x values
    [73, 73, 95, 95], /* y values */ click_x, click_y)) {
    settings.coordinates = !settings.coordinates;
    return true;
  }
  return false;
}