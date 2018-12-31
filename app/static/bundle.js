!function(Q){var F={};function B(U){if(F[U])return F[U].exports;var s=F[U]={i:U,l:!1,exports:{}};return Q[U].call(s.exports,s,s.exports,B),s.l=!0,s.exports}B.m=Q,B.c=F,B.d=function(Q,F,U){B.o(Q,F)||Object.defineProperty(Q,F,{enumerable:!0,get:U})},B.r=function(Q){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(Q,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(Q,"__esModule",{value:!0})},B.t=function(Q,F){if(1&F&&(Q=B(Q)),8&F)return Q;if(4&F&&"object"==typeof Q&&Q&&Q.__esModule)return Q;var U=Object.create(null);if(B.r(U),Object.defineProperty(U,"default",{enumerable:!0,value:Q}),2&F&&"string"!=typeof Q)for(var s in Q)B.d(U,s,function(F){return Q[F]}.bind(null,s));return U},B.n=function(Q){var F=Q&&Q.__esModule?function(){return Q.default}:function(){return Q};return B.d(F,"a",F),F},B.o=function(Q,F){return Object.prototype.hasOwnProperty.call(Q,F)},B.p="",B(B.s=0)}([function(module,exports){eval("// game.js\n// import '@babel/polyfill';\n\n/* Initializing */\nconst socket = io.connect('//' + document.domain + ':' + location.port);\nlet user = 0;\nconst canvas = document.getElementById('canvas');\ncanvas.addEventListener(\"contextmenu\", function (e) {\n  e.preventDefault();\n}, false);\nconst ctx = canvas.getContext('2d');\n\nif (window.innerWidth < 500) {\n  canvas.width = 270;\n  canvas.height = 290;\n}\n\nconst mid_width = canvas.width / 2;\nconst mid_height = canvas.height / 2;\nlet tile_buffer = 0; // Tile Buffer: How large tiles are\n// character start (0,0)\n\nlet cx = 0;\nlet cy = 0;\nlet dir = 0;\nlet sx = 0;\nlet sy = 0;\nlet mouse_down = 0;\nconst tilesheet = new Image();\ntilesheet.src = \"static/tilesheet.png\";\nconst charsheet = new Image();\ncharsheet.src = \"static/charsheet.png\";\nlet map = [];\n/* MAP OPTIONS */\n\nlet tiles = {};\nlet all_users = {};\n/* DRAWING */\n\nctx.font = \"11pt Verdana\";\nctx.textAlign = \"end\";\nconst w = canvas.clientWidth;\nconst h = canvas.clientHeight - 20;\n\nfunction draw() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n\n  for (let x = 0; x < w; x += tile_buffer) {\n    const curr_x = x / tile_buffer + (cx - sx);\n\n    for (let y = 0; y < h; y += tile_buffer) {\n      const tile = map[y / tile_buffer + (cy - sy)][curr_x];\n\n      if (Array.isArray(tile)) {\n        for (const def in tile) {\n          drawTile(tile[def], x, y);\n        }\n      } else {\n        drawTile(tile, x, y);\n      }\n    }\n  }\n\n  drawOthers(); // Fill the local character tile\n\n  if (charsheet.complete) {\n    drawPlayer(sx, sy, dir);\n  } else {\n    charsheet.addEventListener('load', drawPlayer);\n  } // Fill the position\n\n\n  ctx.fillStyle = \"white\";\n  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);\n  ctx.strokeText(\"(\" + cx + \", \" + cy + \")\", 14 * tile_buffer + 30, 15 * tile_buffer + 15);\n}\n\nfunction drawTile(tile, x, y) {\n  ctx.beginPath();\n\n  if (tilesheet.complete) {\n    drawImage(tile, x, y);\n  } else {\n    tilesheet.load = drawImage.bind(tile, x, y);\n  }\n\n  ctx.moveTo(x, y);\n  ctx.lineTo(x + tile_buffer, y);\n  ctx.moveTo(x, y);\n  ctx.lineTo(x, y + tile_buffer);\n  ctx.stroke();\n  ctx.closePath();\n}\n\nfunction drawPlayer(x_, y_, direction) {\n  ctx.strokeStyle = \"transparent\";\n  ctx.drawImage(charsheet, direction * tile_buffer, 0, tile_buffer, tile_buffer, x_ * tile_buffer, y_ * tile_buffer, tile_buffer, tile_buffer);\n}\n\nfunction drawImage(tile, x, y) {\n  ctx.strokeStyle = \"transparent\";\n  ctx.drawImage(tilesheet, tile % 10 * tile_buffer, Math.floor(tile / 10) * tile_buffer, tile_buffer, tile_buffer, x, y, tile_buffer, tile_buffer);\n}\n\nfunction drawOthers() {\n  for (const u in all_users) {\n    if (u != user) {\n      const ucx = all_users[u]['cx'];\n      const ucy = all_users[u]['cy'];\n      const x = ucx - cx;\n      const y = ucy - cy;\n\n      if (x >= -sx && x <= sx && y >= -sy && y <= sy) {\n        // Fill the character tile\n        drawPlayer(x + sx, y + sy, all_users[u]['direction']);\n      }\n    }\n  }\n}\n/* MOVEMENT */\n\n\nfunction sendAction(e) {\n  if (![32, 37, 38, 39, 40, 65, 68, 69, 83, 87].includes(e.keyCode)) return;\n  e.preventDefault();\n  listener(); // Reset key listener.\n\n  if (e.keyCode == 32) {\n    // Spacebar\n    console.log(\"Eventually we will implement the spacebar for interacting\" + \" with items below your character.\");\n  } else if (e.keyCode == 69) {\n    console.log(\"Eventually we will implement the 'e' key for interacting\" + \" with nearby npcs and objects, if your player is facing them!\");\n  }\n\n  socket.emit('json', JSON.stringify({\n    'user': user,\n    'action': e.keyCode\n  }));\n}\n\nfunction determineClick(click_x, click_y) {\n  const mid_offset = 15;\n  const mid_low = mid_width - mid_offset;\n  const mid_high = mid_width - mid_offset;\n\n  if (polygon_click_test(4, [mid_low, mid_high, mid_high, mid_low], // x values\n  [mid_low, mid_low, mid_high, mid_high], // y values\n  click_x, click_y)) {\n    sendAction({\n      'keyCode': 32,\n      'preventDefault': function preventDefault() {}\n    }); // Spacebar\n  } else if (polygon_click_test(3, [0, mid_width, canvas.width], [0, mid_height, 0], click_x, click_y)) {\n    sendAction({\n      'keyCode': 38,\n      'preventDefault': function preventDefault() {}\n    }); // Up\n  } else if (polygon_click_test(3, [0, mid_width, canvas.width], [canvas.height, mid_height, canvas.height], click_x, click_y)) {\n    sendAction({\n      'keyCode': 40,\n      'preventDefault': function preventDefault() {}\n    }); // Down\n  } else if (polygon_click_test(3, [0, mid_width, 0], [0, mid_height, canvas.height], click_x, click_y)) {\n    sendAction({\n      'keyCode': 37,\n      'preventDefault': function preventDefault() {}\n    }); // Left\n  } else if (polygon_click_test(3, [canvas.width, mid_width, canvas.width], [0, mid_height, canvas.height], click_x, click_y)) {\n    sendAction({\n      'keyCode': 39,\n      'preventDefault': function preventDefault() {}\n    }); // Right\n  }\n} // polygon_click_test by Wm. Randolph Franklin\n// int list(int) list(int) int int -> bool\n// Consumes the number of vertices, along with each vertex coordinate,\n// as a list of x coordinates and a second list of y coordinates.\n// Tests against clicked coordinates to determine whether the\n// click was within the polygon formed by said vertices.\n\n\nfunction polygon_click_test(nvert, vertx, verty, testx, testy) {\n  let i,\n      j,\n      c = false;\n\n  for (i = 0, j = nvert - 1; i < nvert; j = i++) {\n    if (verty[i] > testy != verty[j] > testy && testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i]) {\n      c = !c;\n    }\n  }\n\n  return c;\n}\n\nfunction doMove(movement) {\n  cx = movement['cx'];\n  cy = movement['cy'];\n  dir = movement['direction'];\n}\n\nfunction getClickCoords(e) {\n  e.preventDefault();\n  mouse_down = 1;\n  const click_x = e.offsetX;\n  const click_y = e.offsetY;\n  determineClick(click_x, click_y);\n  window.addEventListener('mouseup', clickListener);\n}\n\nfunction getTouchCoords(e) {\n  e.preventDefault();\n  mouse_down = 2;\n  const click_x = e.touches[0].clientX - canvas.getBoundingClientRect().left;\n  const click_y = e.touches[0].clientY - canvas.getBoundingClientRect().top;\n  determineClick(click_x, click_y);\n  window.addEventListener('touchend', clickListener);\n}\n\nfunction listener() {\n  document.removeEventListener('keydown', sendAction);\n  document.addEventListener('keydown', sendAction);\n}\n\nfunction clickListener(e) {\n  if (e) {\n    e.preventDefault();\n  }\n\n  mouse_down = 0;\n  canvas.removeEventListener('mousedown', getClickCoords);\n  canvas.removeEventListener('touchstart', getTouchCoords);\n  window.removeEventListener('mouseup', clickListener);\n  window.removeEventListener('touchend', clickListener);\n  canvas.addEventListener('mousedown', getClickCoords);\n  canvas.addEventListener('touchstart', getTouchCoords);\n}\n\nlet last;\n\n(function () {\n  function main(timestamp) {\n    if (!last) {\n      last = timestamp;\n      draw();\n    } else {\n      if (timestamp - last > 100) {\n        draw();\n      }\n    }\n\n    requestAnimationFrame(main);\n  }\n\n  socket.on('connect', function () {\n    listener(); // Begin movement listeners\n\n    clickListener();\n  }); // Recieves and populates initial data.\n\n  socket.on('init_data', function (data) {\n    data = JSON.parse(data);\n    user = data[0];\n    cx = data[1][0];\n    cy = data[1][1];\n    dir = data[1][2];\n    map = data[2]['map'];\n    tile_buffer = data[3][0];\n\n    if (canvas.width < 450) {\n      sx = 4;\n      sy = 4;\n    } else {\n      sx = data[3][1];\n      sy = data[3][2];\n    }\n\n    main(); // Start the cycle\n  });\n  socket.on('tiles', function (data) {\n    tiles = JSON.parse(data);\n  }); // Recieves and populates map data.\n\n  socket.on('map_data', function (data) {\n    data = JSON.parse(data);\n  }); // Moves the local player\n\n  socket.on('movement_self', function (data) {\n    data = JSON.parse(data);\n    if (user == data['user']) doMove(data);\n  }); // Updates all players\n\n  socket.on('update_all', function (data) {\n    all_users = JSON.parse(data);\n  });\n  socket.on('failure', function (data) {\n    console.log('Unsynchronized.');\n  });\n})();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9nYW1lLmpzP2U2NTciXSwibmFtZXMiOlsic29ja2V0IiwiaW8iLCJjb25uZWN0IiwiZG9jdW1lbnQiLCJkb21haW4iLCJsb2NhdGlvbiIsInBvcnQiLCJ1c2VyIiwiY2FudmFzIiwiZ2V0RWxlbWVudEJ5SWQiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY3R4IiwiZ2V0Q29udGV4dCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ3aWR0aCIsImhlaWdodCIsIm1pZF93aWR0aCIsIm1pZF9oZWlnaHQiLCJ0aWxlX2J1ZmZlciIsImN4IiwiY3kiLCJkaXIiLCJzeCIsInN5IiwibW91c2VfZG93biIsInRpbGVzaGVldCIsIkltYWdlIiwic3JjIiwiY2hhcnNoZWV0IiwibWFwIiwidGlsZXMiLCJhbGxfdXNlcnMiLCJmb250IiwidGV4dEFsaWduIiwidyIsImNsaWVudFdpZHRoIiwiaCIsImNsaWVudEhlaWdodCIsImRyYXciLCJjbGVhclJlY3QiLCJ4IiwiY3Vycl94IiwieSIsInRpbGUiLCJBcnJheSIsImlzQXJyYXkiLCJkZWYiLCJkcmF3VGlsZSIsImRyYXdPdGhlcnMiLCJjb21wbGV0ZSIsImRyYXdQbGF5ZXIiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsInN0cm9rZVRleHQiLCJiZWdpblBhdGgiLCJkcmF3SW1hZ2UiLCJsb2FkIiwiYmluZCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImNsb3NlUGF0aCIsInhfIiwieV8iLCJkaXJlY3Rpb24iLCJzdHJva2VTdHlsZSIsIk1hdGgiLCJmbG9vciIsInUiLCJ1Y3giLCJ1Y3kiLCJzZW5kQWN0aW9uIiwiaW5jbHVkZXMiLCJrZXlDb2RlIiwibGlzdGVuZXIiLCJjb25zb2xlIiwibG9nIiwiZW1pdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZXRlcm1pbmVDbGljayIsImNsaWNrX3giLCJjbGlja195IiwibWlkX29mZnNldCIsIm1pZF9sb3ciLCJtaWRfaGlnaCIsInBvbHlnb25fY2xpY2tfdGVzdCIsIm52ZXJ0IiwidmVydHgiLCJ2ZXJ0eSIsInRlc3R4IiwidGVzdHkiLCJpIiwiaiIsImMiLCJkb01vdmUiLCJtb3ZlbWVudCIsImdldENsaWNrQ29vcmRzIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJjbGlja0xpc3RlbmVyIiwiZ2V0VG91Y2hDb29yZHMiLCJ0b3VjaGVzIiwiY2xpZW50WCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImxlZnQiLCJjbGllbnRZIiwidG9wIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImxhc3QiLCJtYWluIiwidGltZXN0YW1wIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwib24iLCJkYXRhIiwicGFyc2UiXSwibWFwcGluZ3MiOiJBQUFBO0FBRUE7O0FBRUE7QUFDQSxNQUFNQSxNQUFNLEdBQUdDLEVBQUUsQ0FBQ0MsT0FBSCxDQUFXLE9BQU9DLFFBQVEsQ0FBQ0MsTUFBaEIsR0FBeUIsR0FBekIsR0FBK0JDLFFBQVEsQ0FBQ0MsSUFBbkQsQ0FBZjtBQUVBLElBQUlDLElBQUksR0FBRyxDQUFYO0FBRUEsTUFBTUMsTUFBTSxHQUFHTCxRQUFRLENBQUNNLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBZjtBQUNBRCxNQUFNLENBQUNFLGdCQUFQLENBQXdCLGFBQXhCLEVBQ0UsVUFBVUMsQ0FBVixFQUFhO0FBQUNBLEdBQUMsQ0FBQ0MsY0FBRjtBQUFvQixDQURwQyxFQUNzQyxLQUR0QztBQUdBLE1BQU1DLEdBQUcsR0FBR0wsTUFBTSxDQUFDTSxVQUFQLENBQWtCLElBQWxCLENBQVo7O0FBRUEsSUFBSUMsTUFBTSxDQUFDQyxVQUFQLEdBQW9CLEdBQXhCLEVBQTZCO0FBQzNCUixRQUFNLENBQUNTLEtBQVAsR0FBZSxHQUFmO0FBQ0FULFFBQU0sQ0FBQ1UsTUFBUCxHQUFnQixHQUFoQjtBQUNEOztBQUVELE1BQU1DLFNBQVMsR0FBR1gsTUFBTSxDQUFDUyxLQUFQLEdBQWUsQ0FBakM7QUFDQSxNQUFNRyxVQUFVLEdBQUdaLE1BQU0s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LEdBQUdwQyxJQUFJLENBQUNxQyxLQUFMLENBQVdELElBQVgsQ0FBUDtBQUNBLFFBQUk5RyxJQUFJLElBQUk4RyxJQUFJLENBQUMsTUFBRCxDQUFoQixFQUNFbkIsTUFBTSxDQUFDbUIsSUFBRCxDQUFOO0FBQ0gsR0FKRCxFQWpEVyxDQXVEWDs7QUFDQXJILFFBQU0sQ0FBQ29ILEVBQVAsQ0FBVSxZQUFWLEVBQXdCLFVBQVVDLElBQVYsRUFBZ0I7QUFDdENuRixhQUFTLEdBQUcrQyxJQUFJLENBQUNxQyxLQUFMLENBQVdELElBQVgsQ0FBWjtBQUNELEdBRkQ7QUFJQXJILFFBQU0sQ0FBQ29ILEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFVBQVVDLElBQVYsRUFBZ0I7QUFDbkN2QyxXQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWjtBQUNELEdBRkQ7QUFHRCxDQS9ERCIsImZpbGUiOiIwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gZ2FtZS5qc1xyXG5cclxuLy8gaW1wb3J0ICdAYmFiZWwvcG9seWZpbGwnO1xyXG5cclxuLyogSW5pdGlhbGl6aW5nICovXHJcbmNvbnN0IHNvY2tldCA9IGlvLmNvbm5lY3QoJy8vJyArIGRvY3VtZW50LmRvbWFpbiArICc6JyArIGxvY2F0aW9uLnBvcnQpO1xyXG5cclxubGV0IHVzZXIgPSAwO1xyXG5cclxuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xyXG5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsXHJcbiAgZnVuY3Rpb24gKGUpIHtlLnByZXZlbnREZWZhdWx0KCk7fSwgZmFsc2UpO1xyXG5cclxuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG5pZiAod2luZG93LmlubmVyV2lkdGggPCA1MDApIHtcclxuICBjYW52YXMud2lkdGggPSAyNzA7XHJcbiAgY2FudmFzLmhlaWdodCA9IDI5MDtcclxufVxyXG5cclxuY29uc3QgbWlkX3dpZHRoID0gY2FudmFzLndpZHRoIC8gMjtcclxuY29uc3QgbWlkX2hlaWdodCA9IGNhbnZhcy5oZWlnaHQgLyAyO1xyXG5cclxubGV0IHRpbGVfYnVmZmVyID0gMDsgLy8gVGlsZSBCdWZmZXI6IEhvdyBsYXJnZSB0aWxlcyBhcmVcclxuXHJcbi8vIGNoYXJhY3RlciBzdGFydCAoMCwwKVxyXG5sZXQgY3ggPSAwO1xyXG5sZXQgY3kgPSAwO1xyXG5sZXQgZGlyID0gMDtcclxuXHJcbmxldCBzeCA9IDA7XHJcbmxldCBzeSA9IDA7XHJcblxyXG5sZXQgbW91c2VfZG93biA9IDA7XHJcblxyXG5jb25zdCB0aWxlc2hlZXQgPSBuZXcgSW1hZ2UoKTtcclxudGlsZXNoZWV0LnNyYyA9IFwic3RhdGljL3RpbGVzaGVldC5wbmdcIjtcclxuXHJcbmNvbnN0IGNoYXJzaGVldCA9IG5ldyBJbWFnZSgpO1xyXG5jaGFyc2hlZXQuc3JjID0gXCJzdGF0aWMvY2hhcnNoZWV0LnBuZ1wiO1xyXG5cclxubGV0IG1hcCA9IFtdO1xyXG5cclxuLyogTUFQIE9QVElPTlMgKi9cclxubGV0IHRpbGVzID0ge307XHJcbmxldCBhbGxfdXNlcnMgPSB7fTtcclxuXHJcbi8qIERSQVdJTkcgKi9cclxuY3R4LmZvbnQgPSBcIjExcHQgVmVyZGFuYVwiO1xyXG5jdHgudGV4dEFsaWduID0gXCJlbmRcIjtcclxuY29uc3QgdyA9IGNhbnZhcy5jbGllbnRXaWR0aDtcclxuY29uc3QgaCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgLSAyMDtcclxuZnVuY3Rpb24gZHJhdygpIHtcclxuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgZm9yIChsZXQgeCA9IDA7IHggPCB3OyB4ICs9IHRpbGVfYnVmZmVyKSB7XHJcbiAgICBjb25zdCBjdXJyX3ggPSB4L3RpbGVfYnVmZmVyKyhjeC1zeCk7XHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGg7IHkgKz0gdGlsZV9idWZmZXIpIHtcclxuICAgICAgY29uc3QgdGlsZSA9IG1hcFt5L3RpbGVfYnVmZmVyKyhjeS1zeSldW2N1cnJfeF07XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRpbGUpKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBkZWYgaW4gdGlsZSkge1xyXG4gICAgICAgICAgZHJhd1RpbGUodGlsZVtkZWZdLCB4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZHJhd1RpbGUodGlsZSwgeCwgeSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXdPdGhlcnMoKTtcclxuXHJcbiAgLy8gRmlsbCB0aGUgbG9jYWwgY2hhcmFjdGVyIHRpbGVcclxuICBpZiAoY2hhcnNoZWV0LmNvbXBsZXRlKSB7XHJcbiAgICBkcmF3UGxheWVyKHN4LCBzeSwgZGlyKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBjaGFyc2hlZXQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGRyYXdQbGF5ZXIpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmlsbCB0aGUgcG9zaXRpb25cclxuICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gIGN0eC5maWxsUmVjdCgwLCBjYW52YXMuaGVpZ2h0IC0gMjAsIGNhbnZhcy53aWR0aCwgMjApO1xyXG4gIGN0eC5zdHJva2VUZXh0KFxyXG4gICAgXCIoXCIgKyBjeCArIFwiLCBcIiArIGN5ICsgXCIpXCIsXHJcbiAgICAxNCp0aWxlX2J1ZmZlciszMCwgMTUqdGlsZV9idWZmZXIrMTVcclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3VGlsZSh0aWxlLCB4LCB5KSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGlmICh0aWxlc2hlZXQuY29tcGxldGUpIHtcclxuICAgIGRyYXdJbWFnZSh0aWxlLCB4LCB5KTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICB0aWxlc2hlZXQubG9hZCA9IGRyYXdJbWFnZS5iaW5kKHRpbGUsIHgsIHkpO1xyXG4gIH1cclxuICBjdHgubW92ZVRvKHgsIHkpO1xyXG4gIGN0eC5saW5lVG8oeCArIHRpbGVfYnVmZmVyLCB5KTtcclxuICBjdHgubW92ZVRvKHgsIHkpO1xyXG4gIGN0eC5saW5lVG8oeCwgeSArIHRpbGVfYnVmZmVyKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3UGxheWVyKHhfLCB5XywgZGlyZWN0aW9uKSB7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gXCJ0cmFuc3BhcmVudFwiO1xyXG4gIGN0eC5kcmF3SW1hZ2UoY2hhcnNoZWV0LCBkaXJlY3Rpb24gKiB0aWxlX2J1ZmZlciwgMCxcclxuICAgIHRpbGVfYnVmZmVyLCB0aWxlX2J1ZmZlciwgeF8qdGlsZV9idWZmZXIsIHlfKnRpbGVfYnVmZmVyLCB0aWxlX2J1ZmZlciwgdGlsZV9idWZmZXIpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdJbWFnZSh0aWxlLCB4LCB5KSB7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gXCJ0cmFuc3BhcmVudFwiO1xyXG4gIGN0eC5kcmF3SW1hZ2UodGlsZXNoZWV0LCAodGlsZSAlIDEwKSAqIHRpbGVfYnVmZmVyLCBNYXRoLmZsb29yKHRpbGUgLyAxMCkgKiB0aWxlX2J1ZmZlcixcclxuICAgIHRpbGVfYnVmZmVyLCB0aWxlX2J1ZmZlciwgeCwgeSwgdGlsZV9idWZmZXIsIHRpbGVfYnVmZmVyKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd090aGVycygpIHtcclxuICBmb3IgKGNvbnN0IHUgaW4gYWxsX3VzZXJzKSB7XHJcbiAgICBpZiAodSAhPSB1c2VyKSB7XHJcbiAgICAgIGNvbnN0IHVjeCA9IGFsbF91c2Vyc1t1XVsnY3gnXTtcclxuICAgICAgY29uc3QgdWN5ID0gYWxsX3VzZXJzW3VdWydjeSddO1xyXG4gICAgICBjb25zdCB4ID0gdWN4IC0gY3g7XHJcbiAgICAgIGNvbnN0IHkgPSB1Y3kgLSBjeTtcclxuICAgICAgaWYgKHggPj0gLXN4ICYmIHggPD0gc3ggJiYgeSA+PSAtc3kgJiYgeSA8PSBzeSkge1xyXG4gICAgICAgIC8vIEZpbGwgdGhlIGNoYXJhY3RlciB0aWxlXHJcbiAgICAgICAgZHJhd1BsYXllcih4K3N4LCB5K3N5LCBhbGxfdXNlcnNbdV1bJ2RpcmVjdGlvbiddKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyogTU9WRU1FTlQgKi9cclxuZnVuY3Rpb24gc2VuZEFjdGlvbihlKSB7XHJcbiAgaWYgKCFbXHJcbiAgICAzMiwgMzcsIDM4LCAzOSwgNDAsIDY1LCA2OCwgNjksIDgzLCA4N1xyXG4gIF0uaW5jbHVkZXMoZS5rZXlDb2RlKSkgcmV0dXJuO1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgbGlzdGVuZXIoKTsgLy8gUmVzZXQga2V5IGxpc3RlbmVyLlxyXG5cclxuICBpZiAoZS5rZXlDb2RlID09IDMyKSB7IC8vIFNwYWNlYmFyXHJcbiAgICBjb25zb2xlLmxvZyhcIkV2ZW50dWFsbHkgd2Ugd2lsbCBpbXBsZW1lbnQgdGhlIHNwYWNlYmFyIGZvciBpbnRlcmFjdGluZ1wiXHJcbiAgICAgICsgXCIgd2l0aCBpdGVtcyBiZWxvdyB5b3VyIGNoYXJhY3Rlci5cIik7XHJcbiAgfVxyXG5cclxuICBlbHNlIGlmIChlLmtleUNvZGUgPT0gNjkpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiRXZlbnR1YWxseSB3ZSB3aWxsIGltcGxlbWVudCB0aGUgJ2UnIGtleSBmb3IgaW50ZXJhY3RpbmdcIlxyXG4gICAgICArIFwiIHdpdGggbmVhcmJ5IG5wY3MgYW5kIG9iamVjdHMsIGlmIHlvdXIgcGxheWVyIGlzIGZhY2luZyB0aGVtIVwiKTtcclxuICB9XHJcblxyXG4gIHNvY2tldC5lbWl0KCdqc29uJywgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgJ3VzZXInOiB1c2VyLFxyXG4gICAgJ2FjdGlvbic6IGUua2V5Q29kZSxcclxuICB9KSlcclxufVxyXG5cclxuZnVuY3Rpb24gZGV0ZXJtaW5lQ2xpY2soY2xpY2tfeCwgY2xpY2tfeSkge1xyXG4gIGNvbnN0IG1pZF9vZmZzZXQgPSAxNTtcclxuICBjb25zdCBtaWRfbG93ID0gbWlkX3dpZHRoIC0gbWlkX29mZnNldDtcclxuICBjb25zdCBtaWRfaGlnaCA9IG1pZF93aWR0aCAtIG1pZF9vZmZzZXQ7XHJcbiAgaWYgKHBvbHlnb25fY2xpY2tfdGVzdCg0LFxyXG4gICAgW21pZF9sb3csIG1pZF9oaWdoLCBtaWRfaGlnaCwgbWlkX2xvd10sIC8vIHggdmFsdWVzXHJcbiAgICBbbWlkX2xvdywgbWlkX2xvdywgbWlkX2hpZ2gsIG1pZF9oaWdoXSwgLy8geSB2YWx1ZXNcclxuICAgIGNsaWNrX3gsIGNsaWNrX3kpKSB7XHJcbiAgICBzZW5kQWN0aW9uKHsna2V5Q29kZSc6IDMyLCAncHJldmVudERlZmF1bHQnOiBmdW5jdGlvbigpe319KTsgLy8gU3BhY2ViYXJcclxuICB9XHJcbiAgZWxzZSBpZiAocG9seWdvbl9jbGlja190ZXN0KDMsXHJcbiAgICBbMCwgbWlkX3dpZHRoLCBjYW52YXMud2lkdGhdLCBbMCwgbWlkX2hlaWdodCwgMF0sXHJcbiAgICBjbGlja194LCBjbGlja195KSkge1xyXG4gICAgc2VuZEFjdGlvbih7J2tleUNvZGUnOiAzOCwgJ3ByZXZlbnREZWZhdWx0JzogZnVuY3Rpb24oKXt9fSk7IC8vIFVwXHJcbiAgfVxyXG4gIGVsc2UgaWYgKHBvbHlnb25fY2xpY2tfdGVzdCgzLFxyXG4gICAgWzAsIG1pZF93aWR0aCwgY2FudmFzLndpZHRoXSwgW2NhbnZhcy5oZWlnaHQsIG1pZF9oZWlnaHQsIGNhbnZhcy5oZWlnaHRdLFxyXG4gICAgY2xpY2tfeCwgY2xpY2tfeSkpIHtcclxuICAgIHNlbmRBY3Rpb24oeydrZXlDb2RlJzogNDAsICdwcmV2ZW50RGVmYXVsdCc6IGZ1bmN0aW9uKCl7fX0pOyAvLyBEb3duXHJcbiAgfVxyXG4gIGVsc2UgaWYgKHBvbHlnb25fY2xpY2tfdGVzdCgzLFxyXG4gICAgWzAsIG1pZF93aWR0aCwgMF0sIFswLCBtaWRfaGVpZ2h0LCBjYW52YXMuaGVpZ2h0XSxcclxuICAgIGNsaWNrX3gsIGNsaWNrX3kpKSB7XHJcbiAgICBzZW5kQWN0aW9uKHsna2V5Q29kZSc6IDM3LCAncHJldmVudERlZmF1bHQnOiBmdW5jdGlvbigpe319KTsgLy8gTGVmdFxyXG4gIH1cclxuICBlbHNlIGlmIChwb2x5Z29uX2NsaWNrX3Rlc3QoMyxcclxuICAgIFtjYW52YXMud2lkdGgsIG1pZF93aWR0aCwgY2FudmFzLndpZHRoXSwgWzAsIG1pZF9oZWlnaHQsIGNhbnZhcy5oZWlnaHRdLFxyXG4gICAgY2xpY2tfeCwgY2xpY2tfeSkpIHtcclxuICAgIHNlbmRBY3Rpb24oeydrZXlDb2RlJzogMzksICdwcmV2ZW50RGVmYXVsdCc6IGZ1bmN0aW9uKCl7fX0pOyAvLyBSaWdodFxyXG4gIH1cclxufVxyXG5cclxuLy8gcG9seWdvbl9jbGlja190ZXN0IGJ5IFdtLiBSYW5kb2xwaCBGcmFua2xpblxyXG4vLyBpbnQgbGlzdChpbnQpIGxpc3QoaW50KSBpbnQgaW50IC0+IGJvb2xcclxuLy8gQ29uc3VtZXMgdGhlIG51bWJlciBvZiB2ZXJ0aWNlcywgYWxvbmcgd2l0aCBlYWNoIHZlcnRleCBjb29yZGluYXRlLFxyXG4vLyBhcyBhIGxpc3Qgb2YgeCBjb29yZGluYXRlcyBhbmQgYSBzZWNvbmQgbGlzdCBvZiB5IGNvb3JkaW5hdGVzLlxyXG4vLyBUZXN0cyBhZ2FpbnN0IGNsaWNrZWQgY29vcmRpbmF0ZXMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlXHJcbi8vIGNsaWNrIHdhcyB3aXRoaW4gdGhlIHBvbHlnb24gZm9ybWVkIGJ5IHNhaWQgdmVydGljZXMuXHJcbmZ1bmN0aW9uIHBvbHlnb25fY2xpY2tfdGVzdCggbnZlcnQsIHZlcnR4LCB2ZXJ0eSwgdGVzdHgsIHRlc3R5ICkge1xyXG4gICAgbGV0IGksIGosIGMgPSBmYWxzZTtcclxuICAgIGZvciggaSA9IDAsIGogPSBudmVydC0xOyBpIDwgbnZlcnQ7IGogPSBpKysgKSB7XHJcbiAgICAgICAgaWYoICggKCB2ZXJ0eVtpXSA+IHRlc3R5ICkgIT0gKCB2ZXJ0eVtqXSA+IHRlc3R5ICkgKSAmJlxyXG4gICAgICAgICAgICAoIHRlc3R4IDwgKCB2ZXJ0eFtqXSAtIHZlcnR4W2ldICkgKiAoIHRlc3R5IC0gdmVydHlbaV0gKSAvICggdmVydHlbal0gLSB2ZXJ0eVtpXSApICsgdmVydHhbaV0gKSApIHtcclxuICAgICAgICAgICAgICAgIGMgPSAhYztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYztcclxufVxyXG5cclxuZnVuY3Rpb24gZG9Nb3ZlKG1vdmVtZW50KSB7XHJcbiAgY3ggPSBtb3ZlbWVudFsnY3gnXTtcclxuICBjeSA9IG1vdmVtZW50WydjeSddO1xyXG4gIGRpciA9IG1vdmVtZW50WydkaXJlY3Rpb24nXTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2xpY2tDb29yZHMoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBtb3VzZV9kb3duID0gMTtcclxuICBjb25zdCBjbGlja194ID0gZS5vZmZzZXRYO1xyXG4gIGNvbnN0IGNsaWNrX3kgPSBlLm9mZnNldFk7XHJcbiAgZGV0ZXJtaW5lQ2xpY2soY2xpY2tfeCwgY2xpY2tfeSk7XHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBjbGlja0xpc3RlbmVyKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VG91Y2hDb29yZHMoZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICBtb3VzZV9kb3duID0gMjtcclxuICBjb25zdCBjbGlja194ID0gZS50b3VjaGVzWzBdLmNsaWVudFggLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICBjb25zdCBjbGlja195ID0gZS50b3VjaGVzWzBdLmNsaWVudFkgLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gIGRldGVybWluZUNsaWNrKGNsaWNrX3gsIGNsaWNrX3kpO1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGNsaWNrTGlzdGVuZXIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsaXN0ZW5lcigpIHtcclxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VuZEFjdGlvbik7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbmRBY3Rpb24pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGlja0xpc3RlbmVyKGUpIHtcclxuICBpZiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH1cclxuICBtb3VzZV9kb3duID0gMDtcclxuICBjYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZ2V0Q2xpY2tDb29yZHMpO1xyXG4gIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZ2V0VG91Y2hDb29yZHMpO1xyXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2xpY2tMaXN0ZW5lcik7XHJcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgY2xpY2tMaXN0ZW5lcik7XHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGdldENsaWNrQ29vcmRzKTtcclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGdldFRvdWNoQ29vcmRzKTtcclxufVxyXG5cclxubGV0IGxhc3Q7XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gbWFpbiggdGltZXN0YW1wICkge1xyXG4gICAgaWYgKCFsYXN0KSB7XHJcbiAgICAgIGxhc3QgPSB0aW1lc3RhbXBcclxuICAgICAgZHJhdygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICh0aW1lc3RhbXAgLSBsYXN0ID4gMTAwKSB7XHJcbiAgICAgICAgZHJhdygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIG1haW4gKTtcclxuICB9XHJcblxyXG4gIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgbGlzdGVuZXIoKTsgLy8gQmVnaW4gbW92ZW1lbnQgbGlzdGVuZXJzXHJcbiAgICBjbGlja0xpc3RlbmVyKCk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFJlY2lldmVzIGFuZCBwb3B1bGF0ZXMgaW5pdGlhbCBkYXRhLlxyXG4gIHNvY2tldC5vbignaW5pdF9kYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgdXNlciA9IGRhdGFbMF07XHJcbiAgICBjeCA9IGRhdGFbMV1bMF07XHJcbiAgICBjeSA9IGRhdGFbMV1bMV07XHJcbiAgICBkaXIgPSBkYXRhWzFdWzJdO1xyXG4gICAgbWFwICA9IGRhdGFbMl1bJ21hcCddO1xyXG4gICAgdGlsZV9idWZmZXIgPSBkYXRhWzNdWzBdO1xyXG4gICAgaWYgKGNhbnZhcy53aWR0aCA8IDQ1MCkge1xyXG4gICAgICBzeCA9IDQ7XHJcbiAgICAgIHN5ID0gNDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzeCA9IGRhdGFbM11bMV07XHJcbiAgICAgIHN5ID0gZGF0YVszXVsyXTtcclxuICAgIH1cclxuICAgIG1haW4oKTsgLy8gU3RhcnQgdGhlIGN5Y2xlXHJcbiAgfSk7XHJcblxyXG4gIHNvY2tldC5vbigndGlsZXMnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgdGlsZXMgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuICAvLyBSZWNpZXZlcyBhbmQgcG9wdWxhdGVzIG1hcCBkYXRhLlxyXG4gIHNvY2tldC5vbignbWFwX2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIE1vdmVzIHRoZSBsb2NhbCBwbGF5ZXJcclxuICBzb2NrZXQub24oJ21vdmVtZW50X3NlbGYnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICBpZiAodXNlciA9PSBkYXRhWyd1c2VyJ10pXHJcbiAgICAgIGRvTW92ZShkYXRhKTtcclxuICB9KTtcclxuXHJcbiAgLy8gVXBkYXRlcyBhbGwgcGxheWVyc1xyXG4gIHNvY2tldC5vbigndXBkYXRlX2FsbCcsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICBhbGxfdXNlcnMgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gIH0pO1xyXG5cclxuICBzb2NrZXQub24oJ2ZhaWx1cmUnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coJ1Vuc3luY2hyb25pemVkLicpO1xyXG4gIH0pO1xyXG59KSgpO1xyXG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///0\n")}]);