import {
  generateFruitPosition,
  getNextPosition,
  isFruitFound,
  isOutOfBounds,
  isValidMove,
  processGameState,
  validateGameStates,
  validateNewGame,
} from "../src/gameUtils";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { GameStates } from "../src/types";

describe("validateNewGame", () => {
  it("should call next() if width and height are positive numbers", () => {
    const req = getMockReq({ query: { w: "10", h: "5" } });
    const { res, next } = getMockRes({});

    validateNewGame(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return a 400 response if width or height is not a positive number", () => {
    const req = getMockReq({ query: { w: "10", h: "-5" } });
    const { res, next } = getMockRes({});

    validateNewGame(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid request, width and height must be positive numbers.",
    });
  });
});

describe("generateFruitPosition", () => {
  it("should return a Fruit object with random coordinates within the given width and height", () => {
    const width = 10;
    const height = 10;

    const fruit = generateFruitPosition(width, height);

    expect(fruit).toHaveProperty("x");
    expect(fruit.x).toBeGreaterThanOrEqual(0);
    expect(fruit.x).toBeLessThan(width);

    expect(fruit).toHaveProperty("y");
    expect(fruit.y).toBeGreaterThanOrEqual(0);
    expect(fruit.y).toBeLessThan(height);
  });
});

describe("getNextPosition", () => {
  test("should return the next position correctly for x-axis", () => {
    const head = { x: 0, y: 0 };
    const velocity = { velX: 1, velY: 0 };
    const nextPosition = getNextPosition(head, velocity);
    expect(nextPosition).toEqual({ x: 1, y: 0 });
  });

  test("should return the next position correctly for y-axis", () => {
    const head = { x: 0, y: 0 };
    const velocity = { velX: 0, velY: 1 };
    const nextPosition = getNextPosition(head, velocity);
    expect(nextPosition).toEqual({ x: 0, y: 1 });
  });
});

describe("isOutOfBounds", () => {
  test("should return true if the position is out of bounds", () => {
    const position = { x: -1, y: 5 };
    const width = 5;
    const height = 5;
    const result = isOutOfBounds(position, width, height);
    expect(result).toBe(true);
  });

  test("should return false if the position is within bounds", () => {
    const position = { x: 3, y: 3 };
    const width = 5;
    const height = 5;
    const result = isOutOfBounds(position, width, height);
    expect(result).toBe(false);
  });
});

describe("isValidMove", () => {
  it("should return true if the move is valid", () => {
    const currVelocity = { velX: 0, velY: 1 };
    const newVelocity = { velX: 1, velY: 0 };

    const result = isValidMove(currVelocity, newVelocity);

    expect(result).toBe(true);
  });

  it("should return false if the move is invalid due to immediate 180-degree vertical turn", () => {
    const currVelocity = { velX: 0, velY: 1 };
    const newVelocity = { velX: 0, velY: -1 };

    const result = isValidMove(currVelocity, newVelocity);

    expect(result).toBe(false);
  });

  it("should return false if the move is invalid due to immediate 180-degree horizontal turn", () => {
    const currVelocity = { velX: 1, velY: 0 };
    const newVelocity = { velX: -1, velY: 0 };

    const result = isValidMove(currVelocity, newVelocity);

    expect(result).toBe(false);
  });

  it("should return false if the move is invalid due to equal velocity components", () => {
    const currVelocity = { velX: 0, velY: 1 };
    const newVelocity = { velX: 1, velY: 1 };

    const result = isValidMove(currVelocity, newVelocity);

    expect(result).toBe(false);
  });

  it("should return false if the move is invalid due to invalid value", () => {
    const currVelocity = { velX: 0, velY: 1 };
    const newVelocity = { velX: 2, velY: 0 };

    const result = isValidMove(currVelocity, newVelocity);

    expect(result).toBe(false);
  });
});

describe("isFruitFound", () => {
  it("should return true if the fruit is found at the given position", () => {
    const position = { x: 3, y: 5 };
    const fruit = { x: 3, y: 5 };

    const result = isFruitFound(position, fruit);

    expect(result).toBe(true);
  });

  it("should return false if the fruit is not found at the given position", () => {
    const position = { x: 3, y: 5 };
    const fruit = { x: 2, y: 4 };

    const result = isFruitFound(position, fruit);

    expect(result).toBe(false);
  });
});

describe("validateGameStates", () => {
  it("should call next() if game states are valid", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: 0,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 1, velY: 0 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return a 400 response if request is invalid", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 1, velY: 0 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing fields in request body",
    });
  });

  it("should return a 400 response if width or height is invalid", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: -10,
        score: 0,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 1, velY: 0 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid width or height",
    });
  });

  it("should return a 400 response if snake has invalid initial position", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: 0,
        fruit: { x: 5, y: 5 },
        snake: { x: 20, y: 0, velX: 1, velY: 0 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Snake has invalid initial position",
    });
  });

  it("should return a 400 response if fruit has invalid initial position", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: 0,
        fruit: { x: 20, y: 5 },
        snake: { x: 0, y: 0, velX: 1, velY: 0 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fruit has invalid initial position",
    });
  });

  it("should return a 400 response if snake has invalid initial velocity", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: 0,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 1, velY: 1 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Snake has invalid initial velocity",
    });
  });

  it("should return a 400 response if score is invalid", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: -1,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 0, velY: 1 },
        ticks: [{ velX: 1, velY: 0 }],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Score must be positive",
    });
  });

  it("should return a 400 response if ticks are not specified", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: 10,
        score: 0,
        fruit: { x: 5, y: 5 },
        snake: { x: 0, y: 0, velX: 0, velY: 1 },
        ticks: [],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Ticks are not specified",
    });
  });

  it("should return a 400 response with all error message", () => {
    const req = getMockReq({
      body: {
        gameId: "123",
        width: 10,
        height: -10,
        score: -1,
        fruit: { x: 20, y: 5 },
        snake: { x: 5, y: 0, velX: 1, velY: 1 },
        ticks: [],
      },
    });
    const { res, next } = getMockRes({});

    validateGameStates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Invalid width or height, Snake has invalid initial velocity, Score must be positive, Ticks are not specified",
    });
  });
});

describe("processGameState", () => {
  const initialGameState: GameStates = {
    gameId: "123",
    width: 10,
    height: 10,
    score: 0,
    fruit: { x: 1, y: 1 },
    snake: { x: 0, y: 0, velX: 1, velY: 0 },
    ticks: [{ velX: 1, velY: 0 }],
  };

  it("should return 200 and the new state when the fruit is found", () => {
    const gameState: GameStates = {
      ...initialGameState,
      ticks: [
        { velX: 0, velY: 1 },
        { velX: 1, velY: 0 },
      ],
    };

    const [status, result] = processGameState(gameState);

    expect(status).toBe(200);
    expect(result).toHaveProperty("gameId", "123");
    expect(result).toHaveProperty("width", 10);
    expect(result).toHaveProperty("height", 10);
    expect(result).toHaveProperty("score", 1);
    expect(result.hasOwnProperty("fruit")).not.toEqual({ x: 1, y: 1 });
    expect(result).toHaveProperty("snake", { x: 1, y: 1, velX: 1, velY: 0 });
    expect(result).not.toHaveProperty("ticks");
  });

  it("should return 418 when the snake goes out of bounds", () => {
    const gameState: GameStates = {
      ...initialGameState,
      ticks: [{ velX: -1, velY: 0 }],
    };

    const [status, result] = processGameState(gameState);

    expect(status).toBe(418);
    expect(result).toEqual({
      message:
        "Game is over, snake went out of bounds or made an invalid move.",
    });
  });

  it("should return 404 when the fruit is not found after all ticks", () => {
    const gameState: GameStates = {
      ...initialGameState,
      ticks: [
        { velX: 1, velY: 0 },
        { velX: 1, velY: 0 },
      ],
    };

    const [status, result] = processGameState(gameState);

    expect(status).toBe(404);
    expect(result).toEqual({
      message:
        "Fruit not found, the ticks do not lead the snake to the fruit position.",
    });
  });

  it("should return 418 when the snake makes an invalid move", () => {
    const gameState: GameStates = {
      ...initialGameState,
      ticks: [{ velX: 2, velY: 0 }],
    };

    const [status, result] = processGameState(gameState);

    expect(status).toBe(418);
    expect(result).toEqual({
      message:
        "Game is over, snake went out of bounds or made an invalid move.",
    });
  });
});
