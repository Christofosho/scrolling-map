from game import helpers
from game.entity.player import Player

from pytest import fixture
from time import time

@fixture(scope="module")
def owner():
  return Player(
    0, 'admin', 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, time(), []
  )

def test_handle_pickup(owner):
  assert helpers.handle_pickup(owner) == [owner.x, owner.y, owner.username]