# Snake Backend

This is the backend for the Snake game. It provides APIs start new game and validate game steps.

## Installation

1. Clone this repository.
2. Install dependencies by running `npm install`.

## Usage

### Running the Server

To start the server, run:

`npm start`

This will start the server on http://localhost:3000 and listen for incoming requests.

### Running Tests

To run tests, run:

`npm test`

This will run all the test cases and provide the test results.

## Endpoints

### GET /newGame

This endpoint starts a new game and returns the initial game state.

**Query Parameters:**

- `w`: Width of the game board.
- `h`: Height of the game board.

### POST /validateGame

This endpoint validates game steps and processes them accordingly.

**Request Body:**

The request body should contain the current game state and ticks.

**Example Request Body:**

```json
{
  "gameId": "123",
  "width": 10,
  "height": 10,
  "score": 0,
  "fruit": { "x": 3, "y": 5 },
  "snake": { "x": 1, "y": 1, "velX": 1, "velY": 0 },
  "ticks": [
    { "velX": 1, "velY": 0 },
    { "velX": 0, "velY": 1 }
  ]
}
```
