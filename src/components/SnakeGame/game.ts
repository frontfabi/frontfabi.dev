export const GRID_SIZE = 16;

export type Direction = "up" | "down" | "left" | "right";
export type Point = { x: number; y: number };
export type SnakeGame = {
  status: "ready" | "playing" | "game-over";
  direction: Direction | null;
  snake: Point[];
  food: Point;
  score: number;
};

const initialSnake = [{ x: 8, y: 8 }];

const opposite: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function hasPoint(points: Point[], point: Point) {
  return points.some((item) => item.x === point.x && item.y === point.y);
}

function foodFor(snake: Point[], random: () => number): Point {
  const candidate = {
    x: Math.floor(random() * GRID_SIZE),
    y: Math.floor(random() * GRID_SIZE),
  };
  if (!hasPoint(snake, candidate)) return candidate;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!hasPoint(snake, { x, y })) return { x, y };
    }
  }
  return candidate;
}

export function createGame(random = Math.random): SnakeGame {
  return {
    status: "ready",
    direction: null,
    snake: initialSnake,
    food: foodFor(initialSnake, random),
    score: 0,
  };
}

export function changeDirection(game: SnakeGame, direction: Direction): SnakeGame {
  if (game.status === "game-over" || game.direction === opposite[direction])
    return game;
  return { ...game, direction, status: "playing" };
}

export function stepGame(game: SnakeGame, random = Math.random): SnakeGame {
  if (game.status !== "playing" || !game.direction) return game;

  const head = game.snake[0];
  const nextHead = {
    x: head.x + (game.direction === "left" ? -1 : game.direction === "right" ? 1 : 0),
    y: head.y + (game.direction === "up" ? -1 : game.direction === "down" ? 1 : 0),
  };
  const eats = nextHead.x === game.food.x && nextHead.y === game.food.y;
  const body = eats ? game.snake : game.snake.slice(0, -1);
  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= GRID_SIZE;

  if (hitWall || hasPoint(body, nextHead)) return { ...game, status: "game-over" };

  const snake = eats ? [nextHead, ...game.snake] : [nextHead, ...body];
  return {
    ...game,
    snake,
    food: eats ? foodFor(snake, random) : game.food,
    score: eats ? game.score + 1 : game.score,
  };
}
