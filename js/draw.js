// draw.js

import * as game from './game';
import * as input from './input';
import * as player from './player';
import * as settings from './settings';
import * as map from './map';

export const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

// Rows of 10 30x30 tiles.
const tilesheet = new Image();
tilesheet.src = "static/tilesheet.png";

const charsheet = new Image();
charsheet.src = "static/charsheet.png";

const optionsheet = new Image();
optionsheet.src = "static/optionsheet.png";

export let examine_menu_vertices = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

export const OVERLAYS = {
  None: 0,
  Settings: 1,
  Help: 2,
  Inventory: 7
};
export let overlay = OVERLAYS.None;

// Small windows means smaller canvas.
if (window.innerWidth < 600 || window.innerHeight < 600) {
  canvas.width = 330;
  canvas.height = 290;
}

/* DRAWING */
export function draw() {
  const canvas_width = canvas.width - 60;
  const canvas_height = canvas.height - 20;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (overlay == OVERLAYS.Settings) {
    drawSettings(canvas_width, canvas_height);
  }
  else if (overlay == OVERLAYS.Help) {
    drawHelp(canvas_width, canvas_height);
  }
  else {
    drawTiles(canvas_width, canvas_height);
    drawOthers();

    // Fill the local character tile
    if (charsheet.complete) {
      drawPlayer(map.border_size, map.border_size, player.dir, player.username);
    }
    else {
      charsheet.addEventListener('load', drawPlayer);
    }

    if (game.object_name.length > 0) {
      drawObjectName();
    }

    if (game.examine.length > 0) {
      drawRightClickExamine();
    }
  }

  if (settings.settings.coordinates) {
    drawCoordinates(canvas_width, canvas_height);
  }
  drawMapName(canvas_height);
  drawSidePanel();
}

function drawTiles(canvas_width, canvas_height) {
  for (let x = 0; x < canvas_width; x += map.tile_buffer) {
    const curr_x = x/map.tile_buffer+(player.cx-map.border_size);
    for (let y = 0; y < canvas_height; y += map.tile_buffer) {
      const tile = player.current_map[y/map.tile_buffer+(player.cy-map.border_size)][curr_x];
      if (Array.isArray(tile)) {
        for (const def in tile) {
          drawTile(tile[def], x, y);
        }
      }
      else {
        drawTile(tile, x, y);
      }
    }
  }
}

function drawTile(tile, x, y) {
  ctx.beginPath();
  if (tilesheet.complete) {
    drawImage(tile, x, y);
  }
  else {
    tilesheet.load = drawImage.bind(tile, x, y);
  }
  ctx.moveTo(x, y);
  ctx.lineTo(x + map.tile_buffer, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + map.tile_buffer);
  ctx.stroke();
  ctx.closePath();
}

function drawPlayer(x_, y_, direction, username) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(charsheet,
    direction * map.tile_buffer, 0,
    map.tile_buffer, map.tile_buffer,
    x_ * map.tile_buffer, y_ * map.tile_buffer,
    map.tile_buffer, map.tile_buffer
  )

  if (settings.settings.player_names) {
    ctx.fillStyle = "black";
    ctx.font = "10pt Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(username,
      x_ * map.tile_buffer + (map.tile_buffer / 2),
      y_ * map.tile_buffer - 2
    );
  }
}

function drawImage(tile, x, y) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(tilesheet,
    (tile % 10) * map.tile_buffer,
    Math.floor(tile / 10) * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x, y,
    map.tile_buffer, map.tile_buffer
  );
}

function drawOthers() {
  for (const u in game.all_users) {
    if (u != player.username) {
      const ucx = game.all_users[u].cx;
      const ucy = game.all_users[u].cy;
      const x = ucx - player.cx;
      const y = ucy - player.cy;
      if (x >= -map.border_size && x <= map.border_size
        && y >= -map.border_size && y <= map.border_size) {
        // Fill the character tile
        drawPlayer(x + map.border_size, y + map.border_size,
          game.all_users[u].direction,
          game.all_users[u].username
        )
      }
    }
  }
}

function drawSidePanel() {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(optionsheet,
    0, 0,
    60, 450,
    canvas.width - 60, 0,
    60, 450
  );
}

function drawRightClickExamine() {
  let box_width = ctx.measureText(game.examine).width + 10;
  let box_height = 22;

  ctx.fillStyle = "black";
  ctx.fillRect(
    input.last_click_x,
    input.last_click_y,
    box_width, box_height
  );

  examine_menu_vertices = [
    [input.last_click_x - 5, input.last_click_y - 5],
    [input.last_click_x + box_width + 5, input.last_click_y - 5],
    [input.last_click_x + box_width + 5, input.last_click_y + box_height + 5],
    [input.last_click_x - 5, input.last_click_y + box_height + 5]
  ];

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(game.examine,
    input.last_click_x + Math.floor(box_width / 2),
    input.last_click_y + Math.floor(box_height / 2)
  );
}

function drawObjectName() {
  ctx.fillStyle = "white";
  ctx.textAlign = "end";
  ctx.fillText(game.object_name,
    canvas.width - 65, 10);
}

function drawCoordinates(canvas_width, canvas_height) {
  // Fill the position
  ctx.fillStyle = "white";
  ctx.textAlign = "end";
  ctx.fillRect(0, canvas_height, canvas_width, 20);
  ctx.font = "12pt Arial";
  ctx.fillStyle = "black";
  ctx.fillText(
    "(" + player.cx + ", " + player.cy + ")",
    canvas_width - 5, canvas_height + 10
  );
}

function drawOverlay(canvas_width, canvas_height) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas_width, canvas_height);
}

function drawSettings(canvas_width, canvas_height) {
  drawOverlay(canvas_width, canvas_height);
  ctx.fillStyle = "black";
  ctx.textAlign = "start";

  ctx.font = "bold 24pt Arial";
  ctx.fillText("Settings",
  canvas_width / 4 - 25, 40
  );

  ctx.font = "12pt Arial";

  // Show player names
  ctx.fillText(
    "Show Player Names: " + (settings.settings.player_names ? "On" : "Off"),
    canvas_width / 4 - 24,
    70
  );

  // Show current coordinates
  ctx.fillText(
    "Show Coordinates: " + (settings.settings.coordinates ? "On" : "Off"),
    canvas_width / 4 - 24,
    95
  );
}

function drawHelp(canvas_width, canvas_height) {
  drawOverlay(canvas_width, canvas_height);

  ctx.fillStyle = "black";
  ctx.textAlign = "start";

  ctx.font = "bold 24pt Arial";
  ctx.fillText("Helpful Hints",
  canvas_width / 4 - 25, 40
  );

  ctx.font = "12pt Arial";
  ctx.fillText("Movement: WASD, Arrows, or click",
    canvas_width / 4 - 24, 70
  );
  ctx.fillText("Examine: Q or Right-click",
    canvas_width / 4 - 24, 95
  );
  ctx.fillText("Use Object: E or Left-click",
    canvas_width / 4 - 24, 120
  );
}

function drawMapName(canvas_height) {
  ctx.fillStyle = "black";
  ctx.textAlign = "start";
  ctx.font = "bold 12pt Arial";
  ctx.fillText(player.current_map_name,
    5, canvas_height + 11
  );
}
