import assert from "node:assert/strict";
import test from "node:test";
import {
  changeDirection,
  createGame,
  getGameInterval,
  stepGame,
  type SnakeGame,
} from "../src/components/SnakeGame/game.ts";

test("starts paused and moves after choosing a direction", () => {
  const game = createGame(() => 0.5);
  const moving = changeDirection(game, "right");
  const next = stepGame(moving, () => 0.5);

  assert.equal(game.status, "ready");
  assert.equal(next.status, "playing");
  assert.deepEqual(next.snake[0], { x: 9, y: 8 });
});

test("grows and scores when the snake eats food", () => {
  const game: SnakeGame = {
    status: "playing",
    direction: "right",
    snake: [{ x: 8, y: 8 }],
    food: { x: 9, y: 8 },
    score: 0,
  };

  const next = stepGame(game, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 2);
  assert.notDeepEqual(next.food, next.snake[0]);
});

test("ends the game when the snake hits a wall", () => {
  const game: SnakeGame = {
    status: "playing",
    direction: "right",
    snake: [{ x: 15, y: 8 }],
    food: { x: 1, y: 1 },
    score: 3,
  };

  assert.equal(stepGame(game, () => 0).status, "game-over");
});

test("does not allow an immediate reverse", () => {
  const game: SnakeGame = {
    status: "playing",
    direction: "right",
    snake: [{ x: 8, y: 8 }],
    food: { x: 1, y: 1 },
    score: 0,
  };

  assert.equal(changeDirection(game, "left").direction, "right");
});

test("starts slowly and gains speed every 10 points", () => {
  assert.equal(getGameInterval(0), 350);
  assert.equal(getGameInterval(9), 350);
  assert.equal(getGameInterval(10), 340);
  assert.equal(getGameInterval(20), 330);
});
