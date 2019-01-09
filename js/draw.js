// draw.js

import * as game from './game.js';

export const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

// Rows of 10 30x30 tiles.
const tilesheet = new Image();
tilesheet.src = "static/tilesheet.png";

const charsheet = new Image();
charsheet.src = "static/charsheet.png";

const optionsheet = new Image();
optionsheet.src = "static/optionsheet.png";

export let option_menu_vertices = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

// Small windows means smaller canvas.
if (window.innerWidth < 500) {
  canvas.width = 330;
  canvas.height = 290;
}

/* DRAWING */
export function draw() {
  const canvas_width = canvas.width - 60;
  const canvas_height = canvas.height - 20;
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  for (let x = 0; x < canvas_width; x += game.tile_buffer) {
    const curr_x = x/game.tile_buffer+(game.cx-game.sx);
    for (let y = 0; y < canvas_height; y += game.tile_buffer) {
      const tile = game.map[y/game.tile_buffer+(game.cy-game.sy)][curr_x];
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

  drawSidePanel();
  drawOthers();

  // Fill the local character tile
  if (charsheet.complete) {
    drawPlayer(game.sx, game.sy, game.dir, game.user);
  }
  else {
    charsheet.addEventListener('load', drawPlayer);
  }

  if (game.options.length > 0) {
    drawRightClickOptions();
  }

  // Fill the position
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.fillRect(0, canvas_height, canvas_width, 20);
  ctx.strokeText(
    "(" + game.cx + ", " + game.cy + ")",
    canvas_width - 40, canvas_height + 10
  );
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
  ctx.lineTo(x + game.tile_buffer, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + game.tile_buffer);
  ctx.stroke();
  ctx.closePath();
}

function drawPlayer(x_, y_, direction, username) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(charsheet,
    direction * game.tile_buffer, 0,
    game.tile_buffer, game.tile_buffer,
    x_ * game.tile_buffer, y_ * game.tile_buffer,
    game.tile_buffer, game.tile_buffer
  )

  ctx.fillStyle = "black";
  ctx.font = "10pt Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(username,
    x_ * game.tile_buffer + (game.tile_buffer / 2),
    y_ * game.tile_buffer - 2
  );
}

function drawImage(tile, x, y) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(tilesheet,
    (tile % 10) * game.tile_buffer,
    Math.floor(tile / 10) * game.tile_buffer,
    game.tile_buffer, game.tile_buffer,
    x, y,
    game.tile_buffer, game.tile_buffer
  );
}

function drawOthers() {
  for (const u in game.all_users) {
    if (u != game.user) {
      const ucx = game.all_users[u].cx;
      const ucy = game.all_users[u].cy;
      const x = ucx - game.cx;
      const y = ucy - game.cy;
      if (x >= -sx && x <= sx && y >= -sy && y <= sy) {
        // Fill the character tile
        drawPlayer(x + game.sx, y + game.sy,
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

function drawRightClickOptions() {
  let longest = 0;
  game.options.forEach(function(s) {
    if (s.length > longest) {
      longest = s.length;
    }
  });
  let box_width = 10 * longest;
  let box_height = 25 * game.options.length;
  ctx.fillStyle = "black";
  ctx.strokeStyle = "white";
  ctx.fillRect(
    game.last_click_x,
    game.last_click_y,
    box_width, box_height
  );
  option_menu_vertices = [
    [game.last_click_x, game.last_click_y],
    [game.last_click_x + box_width, game.last_click_y],
    [game.last_click_x + box_width, game.last_click_y + box_height],
    [game.last_click_x, game.last_click_y + box_height]
  ];
  game.options.forEach(function(s){
    ctx.strokeText(s,
      game.last_click_x + Math.floor(box_width / 2),
      game.last_click_y + Math.floor(box_height / 2)
    );
  });
}
