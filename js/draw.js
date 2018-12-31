// draw.js

import {all_users, cx, cy, dir, map, sx, sy, tile_buffer, user} from './game.js';

export const canvas = document.getElementById('canvas');
canvas.addEventListener("contextmenu",
  function (e) {e.preventDefault();}, false);

const ctx = canvas.getContext('2d');

// Rows of 10 30x30 tiles.
const tilesheet = new Image();
tilesheet.src = "static/tilesheet.png";

const charsheet = new Image();
charsheet.src = "static/charsheet.png";

// Small windows means smaller canvas.
if (window.innerWidth < 500) {
  canvas.width = 270;
  canvas.height = 290;
}

/* DRAWING */
export function draw() {
  const canvas_height = canvas.height - 20;
  ctx.clearRect(0, 0, canvas.width, canvas_height);
  for (let x = 0; x < canvas.width; x += tile_buffer) {
    const curr_x = x/tile_buffer+(cx-sx);
    for (let y = 0; y < canvas_height; y += tile_buffer) {
      const tile = map[y/tile_buffer+(cy-sy)][curr_x];
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

  drawOthers();

  // Fill the local character tile
  if (charsheet.complete) {
    drawPlayer(sx, sy, dir);
  }
  else {
    charsheet.addEventListener('load', drawPlayer);
  }

  // Fill the position
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.fillRect(0, canvas_height, canvas.width, 20);
  ctx.strokeText(
    "(" + cx + ", " + cy + ")",
    canvas.width - 40, canvas_height + 10
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
  ctx.lineTo(x + tile_buffer, y);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + tile_buffer);
  ctx.stroke();
  ctx.closePath();
}

function drawPlayer(x_, y_, direction) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(charsheet, direction * tile_buffer, 0,
    tile_buffer, tile_buffer, x_*tile_buffer, y_*tile_buffer, tile_buffer, tile_buffer)
}

function drawImage(tile, x, y) {
  ctx.strokeStyle = "transparent";
  ctx.drawImage(tilesheet, (tile % 10) * tile_buffer, Math.floor(tile / 10) * tile_buffer,
    tile_buffer, tile_buffer, x, y, tile_buffer, tile_buffer);
}

function drawOthers() {
  for (const u in all_users) {
    if (u != user) {
      const ucx = all_users[u]['cx'];
      const ucy = all_users[u]['cy'];
      const x = ucx - cx;
      const y = ucy - cy;
      if (x >= -sx && x <= sx && y >= -sy && y <= sy) {
        // Fill the character tile
        drawPlayer(x+sx, y+sy, all_users[u]['direction'])
      }
    }
  }
}
