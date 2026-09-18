"use client";

import { useEffect, useState } from "react";
import {
  changeDirection,
  createGame,
  getGameInterval,
  GRID_SIZE,
  stepGame,
  type Direction,
} from "./game";

const controls: { direction: Direction; label: string; symbol: string }[] = [
  { direction: "up", label: "Cima", symbol: "↑" },
  { direction: "left", label: "Esquerda", symbol: "←" },
  { direction: "down", label: "Baixo", symbol: "↓" },
  { direction: "right", label: "Direita", symbol: "→" },
];

export default function SnakeGame() {
  const [game, setGame] = useState(createGame);
  const gameInterval = getGameInterval(game.score);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction =
        event.key === "ArrowUp" || event.key.toLowerCase() === "w"
          ? "up"
          : event.key === "ArrowDown" || event.key.toLowerCase() === "s"
            ? "down"
            : event.key === "ArrowLeft" || event.key.toLowerCase() === "a"
              ? "left"
              : event.key === "ArrowRight" || event.key.toLowerCase() === "d"
                ? "right"
                : null;
      if (!direction) return;
      event.preventDefault();
      setGame((current) => changeDirection(current, direction));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (game.status !== "playing") return;
    const timer = window.setInterval(() => setGame((current) => stepGame(current)), gameInterval);
    return () => window.clearInterval(timer);
  }, [game.status, gameInterval]);

  const occupied = new Set(game.snake.map((point) => `${point.x},${point.y}`));
  const food = `${game.food.x},${game.food.y}`;

  return (
    <div className="snake-game">
      <div className="snake-game-header">
        <span>score: {game.score}</span>
        <span>{game.status === "game-over" ? "game over" : "game.py"}</span>
      </div>
      <div className="snake-board" role="application" aria-label="Jogo da cobrinha">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
          const point = `${index % GRID_SIZE},${Math.floor(index / GRID_SIZE)}`;
          return (
            <span
              key={point}
              className={occupied.has(point) ? "snake-cell snake" : point === food ? "snake-cell food" : "snake-cell"}
            />
          );
        })}
      </div>
      <div className="snake-controls" aria-label="Controles da cobrinha">
        {controls.map((control) => (
          <button
            key={control.direction}
            aria-label={control.label}
            onClick={() => setGame((current) => changeDirection(current, control.direction))}
          >
            {control.symbol}
          </button>
        ))}
        <button className="snake-reset" onClick={() => setGame(() => createGame())}>
          reiniciar
        </button>
      </div>
      <p>setas ou WASD para jogar</p>
    </div>
  );
}
