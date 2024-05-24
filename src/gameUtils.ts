import { Request, Response } from "express";
import { Position, Velocity, Fruit, GameStates, State } from "./types";

const generateRandomNumber = (val: number): number => {
  return Math.floor(Math.random() * val);
};

export const validateNewGame = (
  req: Request,
  res: Response,
  next: Function
) => {
  const width = parseInt(req.query.w as string);
  const height = parseInt(req.query.h as string);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).json({
      message: "Invalid request, width and height must be positive numbers.",
    });
  }

  next();
};

export const generateFruitPosition = (width: number, height: number): Fruit => {
  return {
    x: generateRandomNumber(width),
    y: generateRandomNumber(height),
  };
};

export const getNextPosition = (head: Position, velocity: Velocity) => {
  return { x: head.x + velocity.velX, y: head.y + velocity.velY };
};

export const isOutOfBounds = (
  position: Position,
  width: number,
  height: number
) => {
  return (
    position.x < 0 ||
    position.x >= width ||
    position.y < 0 ||
    position.y >= height
  );
};

export const isValidMove = (currVelocity: Velocity, newVelocity: Velocity) => {
  const isValidVelocity = (vel: number) => [-1, 0, 1].includes(vel);

  if (!isValidVelocity(newVelocity.velX) || !isValidVelocity(newVelocity.velY))
    return false;

  if (
    (currVelocity.velX !== 0 && newVelocity.velX !== -currVelocity.velX) ||
    (currVelocity.velY !== 0 && newVelocity.velY !== -currVelocity.velY)
  ) {
    // Check if the new velocity is purely horizontal or purely vertical
    return (
      (newVelocity.velX !== 0 && newVelocity.velY === 0) ||
      (newVelocity.velY !== 0 && newVelocity.velX === 0)
    );
  }

  return false;
};

export const isFruitFound = (position: Position, fruit: Fruit) => {
  return position.x === fruit.x && position.y === fruit.y;
};

export const validateGameStates = (
  req: Request,
  res: Response,
  next: Function
) => {
  const gs: GameStates = req.body;
  const validationErrors: string[] = [];

  if (
    !gs.gameId ||
    !gs.fruit ||
    !gs.height ||
    !gs.width ||
    !gs.snake ||
    !gs.ticks ||
    gs.score === undefined
  ) {
    validationErrors.push("Missing fields in request body");
  }

  if (gs.width <= 0 || gs.height <= 0) {
    validationErrors.push("Invalid width or height");
  } else {
    if (isOutOfBounds(gs.snake, gs.width, gs.height)) {
      validationErrors.push("Snake has invalid initial position");
    }
    if (isOutOfBounds(gs.fruit, gs.width, gs.height)) {
      validationErrors.push("Fruit has invalid initial position");
    }
  }

  if (
    gs.snake.velX < -1 ||
    gs.snake.velX > 1 ||
    gs.snake.velY < -1 ||
    gs.snake.velY > 1 ||
    gs.snake.velX === gs.snake.velY
  ) {
    validationErrors.push("Snake has invalid initial velocity");
  }
  if (gs.score < 0) {
    validationErrors.push("Score must be positive");
  }
  if (!Array.isArray(gs.ticks) || gs.ticks.length === 0) {
    validationErrors.push("Ticks are not specified");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ message: validationErrors.join(", ") });
  }

  next();
};

const generateNewFruit = (
  currentFruit: Fruit,
  width: number,
  height: number
): Fruit => {
  let newFruit = currentFruit;
  while (newFruit.x === currentFruit.x && newFruit.y === currentFruit.y) {
    newFruit = generateFruitPosition(width, height);
  }
  return newFruit;
};

export const processGameState = (gs: GameStates): [number, Object] => {
  let currPosition = { x: gs.snake.x, y: gs.snake.y };
  let currVelocity = { velX: gs.snake.velX, velY: gs.snake.velY };
  let nextPosition = currPosition;

  for (const tick of gs.ticks) {
    const newVelocity = { velX: tick.velX, velY: tick.velY };
    nextPosition = getNextPosition(currPosition, newVelocity);

    if (
      isOutOfBounds(nextPosition, gs.width, gs.height) ||
      !isValidMove(currVelocity, newVelocity)
    ) {
      return [
        418,
        {
          message:
            "Game is over, snake went out of bounds or made an invalid move.",
        },
      ];
    }

    if (isFruitFound(nextPosition, gs.fruit)) {
      const newState: State = {
        gameId: gs.gameId,
        width: gs.width,
        height: gs.height,
        fruit: generateNewFruit(gs.fruit, gs.width, gs.height),
        score: gs.score + 1,
        snake: {
          x: gs.fruit.x,
          y: gs.fruit.y,
          velX: tick.velX,
          velY: tick.velY,
        },
      };

      return [200, newState];
    }

    currPosition = nextPosition;
    currVelocity = tick;
  }
  return [
    404,
    {
      message:
        "Fruit not found, the ticks do not lead the snake to the fruit position.",
    },
  ];
};
