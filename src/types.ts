export interface State {
  gameId: string;
  width: number;
  height: number;
  score: number;
  fruit: Fruit;
  snake: Snake;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  velX: number;
  velY: number;
}

export interface Fruit extends Position {}

export interface Snake extends Position, Velocity {}

export interface GameStates extends State {
  ticks: Velocity[];
}
