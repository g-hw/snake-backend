import { app } from "../src/app";
import request from "supertest";

describe("GET /newGame", () => {
  it("should return a new game state with valid width and height", async () => {
    const response = await request(app)
      .get("/newGame")
      .query({ w: "10", h: "10" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("gameId");
    expect(response.body).toHaveProperty("width", 10);
    expect(response.body).toHaveProperty("height", 10);
    expect(response.body).toHaveProperty("score", 0);
    expect(response.body).toHaveProperty("fruit");
    expect(response.body).toHaveProperty("snake", {
      x: 0,
      y: 0,
      velX: 1,
      velY: 0,
    });
  });

  it("should return 400 for invalid width or height", async () => {
    const response = await request(app)
      .get("/newGame")
      .query({ w: "-1", h: "10" });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Invalid request, width and height must be positive numbers."
    );
  });
});

describe("POST /validateGame", () => {
  it("should return 200 OK when snake can reach fruit", async () => {
    const gameState = {
      gameId: "valid-game-id",
      width: 10,
      height: 10,
      score: 0,
      fruit: { x: 1, y: 1 },
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
      ticks: [
        { velX: 1, velY: 0 },
        { velX: 0, velY: 1 },
      ],
    };

    const response = await request(app).post("/validateGame").send(gameState);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("gameId", "valid-game-id");
    expect(response.body).toHaveProperty("width", 10);
    expect(response.body).toHaveProperty("height", 10);
    expect(response.body).toHaveProperty("score", 1);
    expect(response.body).toHaveProperty("fruit");
    expect(response.body.fruit).not.toBe({ x: 2, y: 0 });
    expect(response.body).toHaveProperty("snake", {
      x: 1,
      y: 1,
      velX: 0,
      velY: 1,
    });
  });

  it("should return 404 if ticks do not lead snake to fruit", async () => {
    const invalidGameState = {
      gameId: "valid-game-id",
      width: 10,
      height: 10,
      score: 0,
      fruit: { x: 1, y: 1 },
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
      ticks: [{ velX: 1, velY: 0 }],
    };

    const response = await request(app)
      .post("/validateGame")
      .send(invalidGameState);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "Fruit not found, the ticks do not lead the snake to the fruit position."
    );
  });

  it("should return 418 if snake goes out of bounds", async () => {
    const invalidGameState = {
      gameId: "valid-game-id",
      width: 10,
      height: 10,
      score: 0,
      fruit: { x: 1, y: 1 },
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
      ticks: [{ velX: 0, velY: -1 }],
    };

    const response = await request(app)
      .post("/validateGame")
      .send(invalidGameState);

    expect(response.status).toBe(418);
    expect(response.body.message).toEqual(
      "Game is over, snake went out of bounds or made an invalid move."
    );
  });

  it("should return 418 if move is not valid", async () => {
    const invalidGameState = {
      gameId: "valid-game-id",
      width: 10,
      height: 10,
      score: 0,
      fruit: { x: 1, y: 1 },
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
      ticks: [{ velX: 1, velY: 1 }],
    };

    const response = await request(app)
      .post("/validateGame")
      .send(invalidGameState);

    expect(response.status).toBe(418);
    expect(response.body.message).toEqual(
      "Game is over, snake went out of bounds or made an invalid move."
    );
  });

  it("should return 400 if request is not valid", async () => {
    const invalidGameState = {
      gameId: "valid-game-id",
      width: 10,
      height: 10,
      fruit: { x: 1, y: 1 },
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
      ticks: [{ velX: 0, velY: 1 }],
    };

    const response = await request(app)
      .post("/validateGame")
      .send(invalidGameState);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Missing fields in request body");
  });
});

describe("Wrong method middleware on endpoints", () => {
  it("should return 405 with the correct error message for invalid method on newGame", async () => {
    const response = await request(app).post("/newGame");

    expect(response.status).toBe(405);
    expect(response.body.message).toBe("Method not allowed.");
  });

  it("should return 405 with the correct error message for invalid method on validateGame", async () => {
    const response = await request(app).get("/validateGame");

    expect(response.status).toBe(405);
    expect(response.body.message).toBe("Method not allowed.");
  });
});

describe("Error handling middleware on endpoints", () => {
  it("should return 500 with the correct error message for invalid data on validateGame", async () => {
    const response = await request(app)
      .post("/validateGame")
      .send({ invalidData: true }); // Sending invalid data that triggers the error handling middleware

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error.");
  });
});
