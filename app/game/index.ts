
export class Cell {
  row: number;
  col: number;

  constructor(row:number, col:number) {
    this.row = row;
    this.col = col;
  }
}

export class Player {
  positition: Cell;

  constructor() {

  }
}

export class Game {
  map: number[][];


  constructor(stage) {
    this.map = stage.map;
  }



}
