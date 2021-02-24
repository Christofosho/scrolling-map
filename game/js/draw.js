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
charsheet.src = "static/spritesheet.png";

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
  History: 2,
  Inventory: 3
};
export let overlay = OVERLAYS.None;

// Small windows means smaller canvas.
if (window.innerWidth < 600 || window.innerHeight < 600) {
  canvas.width = 330;
  canvas.height = 300;
}

/* DRAWING */
export function draw() {
  const canvas_width = canvas.width - 60;
  const canvas_height = canvas.height - 30;
  const tile_buffer = settings.settings.zoom ? map.tile_buffer * 3 : map.tile_buffer;
  const border_size = settings.settings.zoom ? 2 : map.border_size;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (settings.settings.zoom) {
    ctx.imageSmoothingEnabled = false;
  }
  else {
    ctx.imageSmoothingEnabled = true;
  }

  if (overlay == OVERLAYS.Settings) {
    drawSettings(canvas_width, canvas_height);
  }
  else if (overlay == OVERLAYS.History) {
    drawHistory(canvas_width, canvas_height);
  }
  else if (overlay == OVERLAYS.Inventory) {
    drawInventory(canvas_width, canvas_height);
  }
  else {
    drawTiles(canvas_width, canvas_height, tile_buffer, border_size);
    drawOthers(tile_buffer, border_size);

    // Fill the local character tile
    if (charsheet.complete) {
      drawPlayer(
        border_size, border_size, player, tile_buffer
      );
    }
    else {
      charsheet.addEventListener('load', drawPlayer.bind(
        border_size, border_size, player, tile_buffer
      ));
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
  drawSidePanel(canvas_width, canvas_height);
}

function drawTiles(canvas_width, canvas_height, tile_buffer, border_size) {
  for (let x = 0; x < canvas_width; x += tile_buffer) {
    const curr_x = x/tile_buffer+(player.cx-border_size);
    for (let y = 0; y < canvas_height; y += tile_buffer) {
      const tile = player.current_map[y/tile_buffer+(player.cy-border_size)][curr_x];
      if (Array.isArray(tile)) {
        for (const def in tile) {
          drawTile(tile[def], x, y, tile_buffer);
        }
      }
      else {
        drawTile(tile, x, y, tile_buffer);
      }
    }
  }
}

function drawTile(tile, x, y, tile_buffer) {
  if (tilesheet.complete) {
    drawImage(tile, x, y, tile_buffer);
  }
  else {
    tilesheet.load = drawImage.bind(tile, x, y, tile_buffer);
  }
  /*
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + map.tile_buffer, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + map.tile_buffer);
  ctx.stroke();
  ctx.closePath();
  */
}

function drawImage(tile, x, y, tile_buffer) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(tilesheet,
    (tile % 10) * map.tile_buffer,
    Math.floor(tile / 10) * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x, y,
    tile_buffer, tile_buffer
  );
}

function drawPlayer(x_, y_, p, tile_buffer) {
  ctx.strokeStyle = "transparent";

  // Used to go horizontally to the next
  // player portion on the spritesheet.
  let y_offset = 4;

  // Shirt
  ctx.drawImage(charsheet,
    (p.direction) * map.tile_buffer,
    p.shirt * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  // Hair
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.hair * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  y_offset += 4;

  // Skin
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.skin * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  y_offset += 4;

  // Eyes
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.eyes * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  y_offset += 4;

  // Pants
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.pants * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  y_offset += 4;

  // Shoes
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.shoes * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  y_offset += 4;

  // Hair Accessory
  ctx.drawImage(charsheet,
    (p.direction + y_offset) * map.tile_buffer,
    p.hair_accessory * map.tile_buffer,
    map.tile_buffer, map.tile_buffer,
    x_ * tile_buffer, y_ * tile_buffer,
    tile_buffer, tile_buffer
  );

  if (settings.settings.player_names) {
    ctx.fillStyle = "black";
    ctx.font = "10pt Merriweather Sans";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(p.username,
      x_ * tile_buffer + (tile_buffer / 2),
      y_ * tile_buffer - 5
    );
  }
}

function drawOthers(tile_buffer, border_size) {
  for (const u in game.all_users) {
    if (u != player.username) {
      const ucx = game.all_users[u].cx;
      const ucy = game.all_users[u].cy;
      const x = ucx - player.cx;
      const y = ucy - player.cy;
      if (x >= -border_size && x <= border_size
        && y >= -border_size && y <= border_size) {
        // Fill the character tile
        drawPlayer(
          x + border_size, y + border_size,
          game.all_users[u], tile_buffer
        )
      }
    }
  }
}

function drawSidePanel(canvas_width, canvas_height) {
  ctx.strokeStyle = "transparent";
  ctx.fillStyle = "white";
  ctx.fillRect(
    canvas_width, 0,
    60, canvas_height
  );
  
  // Settings
  ctx.drawImage(optionsheet,
    0, 0,
    60, 60,
    canvas.width - 60, 0,
    60, 60
  );

  // Message History
  ctx.drawImage(optionsheet,
    0, 60,
    60, 60,
    canvas.width - 60, 60,
    60, 60
  );

  // Inventory
  ctx.drawImage(optionsheet,
    0, 120,
    60, 60,
    canvas.width - 60, 120,
    60, 60
  );

  // Logout
  ctx.drawImage(optionsheet,
    0, 420,
    60, 30,
    canvas.width - 60, canvas.height - 30,
    60, 30
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
  ctx.font = "12pt Merriweather Sans";
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

  ctx.font = "bold 24pt Merriweather Sans";
  ctx.fillText("Settings",
  canvas_width / 4 - 25, 40
  );

  ctx.font = "12pt Merriweather Sans";

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

  // Show current coordinates
  ctx.fillText(
    "Zoom: " + (settings.settings.zoom ? "Close" : "Far"),
    canvas_width / 4 - 24,
    120
  );
}

function drawHistory(canvas_width, canvas_height) {
  drawOverlay(canvas_width, canvas_height);
}

function drawInventory(canvas_width, canvas_height) {
  drawOverlay(canvas_width, canvas_height);
}


function drawMapName(canvas_height) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, canvas_height, canvas.width, 30);
  ctx.fillStyle = "black";
  ctx.textAlign = "start";
  ctx.font = "bold 12pt Merriweather Sans";
  ctx.fillText(player.current_map_name,
    5, canvas.height - 10
  );
}
