import copy
import json
import tkinter as tk

from pathlib import Path
from PIL import Image, ImageTk

class Application(tk.Frame):

  ## Constants
  MAPS = {}
  ENTITIES = {}
  PORTALS = {}
  TILESHEET = None
  DEFAULT_TILE = 5 # Black Blocked Tile Defaults
  APP = Path('..', 'app')
  RESOURCES = Path(APP, 'resources')
  STATIC = Path(APP, 'static')

  def __init__(self, master=None):
    super().__init__(master)
    self.master = master

    # Load resources
    with open(self.RESOURCES / 'maps.json') as m:
      self.MAPS = json.load(m)

    with open(self.RESOURCES / 'entities.json') as t:
      self.ENTITIES = json.load(t)

    with open(self.RESOURCES / 'portals.json') as p:
      self.PORTALS = json.load(p)

    i = Image.open(self.STATIC / 'tilesheet.png')
    self.TILESHEET = ImageTk.PhotoImage(i)

    # Initialize variables.
    self.selected_map = tk.StringVar(self.master)
    self.tiles = [
      [
        self.getTile(30*x, 30*y, (30*(x+1)) - 1, (30*(y+1)) - 1)
        for x in range(int(self.TILESHEET.width() / 30))
      ]
      for y in range(int(self.TILESHEET.height() / 30))
    ]
    self.selected_entity = self.tiles[0][0]

    self.createMapMenu()
    self.createMapView()
    self.createTileMenu()


  ## GUI Creation
  # Following functions create GUI components.
  def createMapMenu(self):
    label = tk.Label(
      self.master, text="Map Selection", font=("Arial", 16))
    label.grid(row=0, column=0, columnspan=3)

    options = [k for k in self.MAPS.keys()]
    width = len(max(options, key=len))
    self.selected_map.set(options[0])

    option_widget = tk.OptionMenu(
      self.master, self.selected_map, *options, command=self.chooseMap
    )
    option_widget.config(width=width)
    option_widget.grid(row=1, column=0, columnspan=3)

  def drawMapTile(self, t_image, x, y):
    b = tk.Button(
      self.master,
      image=t_image,
      width=30,
      height=30,
      command=lambda x=x, y=y: self.applyTile(x, y),
      borderwidth=0, highlightthickness=0
    )
    b.grid(row=y, column=x, columnspan=1)

  def createMapView(self):
    map_name = self.selected_map.get()
    map = self.MAPS.get(map_name)
    if not map:
      print("Failed to load map.")
      return

    for y, row in enumerate(map):
      for x, tile in enumerate(row):
        if isinstance(tile, list):
          t = tile[0]
        else:
          t = tile

        t_image = self.tiles[int(t / 10)][t % 10]

        self.drawMapTile(t_image, x + 4, y)

  def drawTileMenuLabels(self):
    title = tk.Label(
      self.master, text="Tile Selection", font=("Arial", 16))
    title.grid(row=3, column=0, columnspan=3)
    active_title = tk.Label(
      self.master, text="Current:", font=("Arial", 12)
    )
    active_title.grid(row=4, column=0, columnspan=2)

  def drawActiveTile(self):
    b = tk.Button(
      self.master,
      image=self.selected_entity,
      width=30,
      height=30,
      borderwidth=0, highlightthickness=0
    )
    b.grid(row=4, column=2, columnspan=1)

  def drawAllTiles(self):
    x = 0
    y = 6
    z = 0
    for row in self.tiles:
      for tile in row:
        b = tk.Button(
          self.master,
          image=tile,
          width=30,
          height=30,
          command=lambda t=tile: self.chooseTile(t),
          borderwidth=0, highlightthickness=0
        )
        b.grid(row=y, column=x, columnspan=1)
        x += 1
        if x > 2:
          x = 0
          y += 1
        z += 1
        if z > 17: # TODO
          return

  def createTileMenu(self):
    self.drawTileMenuLabels()
    self.drawActiveTile()
    self.drawAllTiles()

  def getTile(self, x1, y1, x2, y2):
    dst = Image.open(self.STATIC / 'tilesheet.png')
    dst = ImageTk.PhotoImage(dst)
    dst.tk.call(dst, 'configure', '-width', 30, '-height', 30)
    dst.tk.call(dst, 'copy', self.TILESHEET, '-from', x1, y1, x2, y2, '-to', 0, 0, 29, 29)
    return dst

  ## GUI Interaction
  # Following functions handle GUI interaction.
  def chooseMap(self, map_name):
    for slave in self.master.grid_slaves():
      if int(slave.grid_info()["column"] > 3):
        slave.grid_forget()
    self.createMapView()

  def chooseTile(self, tile):
    self.selected_entity = tile
    for slave in self.master.grid_slaves():
      if (
        int(slave.grid_info()["column"]) == 2
        and int(slave.grid_info()["row"]) == 4
      ):
        slave.grid_forget()
    self.drawActiveTile()

  def applyTile(self, x, y):
    for slave in self.master.grid_slaves():
      if (
        int(slave.grid_info()["column"]) == x
        and int(slave.grid_info()["row"]) == y
      ):
        slave.grid_forget()
    self.drawMapTile(self.selected_entity, x, y)

  def removeTile(self):
    pass

  ## Window Events
  # Following functions distribute window events.


## Run Program
root = tk.Tk()
app = Application(master=root)
app.mainloop()