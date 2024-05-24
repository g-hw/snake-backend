import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { State, GameStates } from "./types";
import {
  generateFruitPosition,
  processGameState,
  validateGameStates,
  validateNewGame,
} from "./gameUtils";

const app = express();

app.use(express.json());

app.get(
  "/newGame",
  validateNewGame,
  (req: Request, res: Response): Response => {
    const width = parseInt(req.query.w as string);
    const height = parseInt(req.query.h as string);

    const newGame: State = {
      gameId: uuidv4(),
      width,
      height,
      score: 0,
      fruit: generateFruitPosition(width, height),
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
    };
    return res.status(200).json(newGame);
  }
);

app.post(
  "/validateGame",
  validateGameStates,
  (req: Request, res: Response): Response => {
    const gameState: GameStates = req.body;
    const [status, json] = processGameState(gameState);

    return res.status(status).json(json);
  }
);

// Apply the middleware to the endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    (req.path === "/newGame" && req.method !== "GET") ||
    (req.path === "/validateGame" && req.method !== "POST")
  ) {
    return res.status(405).json({ message: "Method not allowed." });
  }
  next();
});

app.use(
  (err: Error, req: Request, res: Response, next: NextFunction): Response => {
    return res.status(500).json({ message: "Internal server error." });
  }
);

export { app };
