
export class Element {
  cell: Cell;
  graphicalRepresentation: any;

  getCell(): Cell {
    return this.cell;
  }
  setCell(cell:Cell) {
    this.cell = cell;
  }
  setGraphicalRepresentation(graphicalRepresentation) {
    this.graphicalRepresentation = graphicalRepresentation;
  }
  getGraphicalRepresentation() {
    return this.graphicalRepresentation;
  }
  getPosition() {
    return {
      positionX: this.cell.centerX,
      positionY: this.cell.centerY,
    };
  }
}

export class Wall extends Element {

}

export class Crate extends Element {

}

export class Bomb extends Element {

}

export class Fire extends Element {

}

export class Cell {
  row: number;
  col: number;
  cellSize: number;
  centerX: number;
  centerY: number;
  insertedElement: Element = null;

  constructor(row:number, col:number, cellSize: number) {
    this.row = row;
    this.col = col;
    this.cellSize = cellSize;
    this.centerY = (row + 0.5) * cellSize;
    this.centerX = (col + 0.5) * cellSize;
  }

  insertElement(element: Element) {
    this.insertedElement = element;
  }

  getInsertedElement(): Element {
    return this.insertedElement;
  }
}

function getElementInCell(type: number):Element {
  switch(type) {
    case 0: return null;
    case 1: return new Wall();
    case 2: return new Crate();
    case 3: return new Bomb();
    case 4: return new Player();
    default: return null;
  }
}

export class Player extends Element {
  positionX:number = 0;
  positionY:number = 0;
  state:string="walk_front";

}

export class Game {
  map: Cell[][];
  elements: Element[] = [];

  constructor(stage, cellSize) {
    this.map = stage.map
      .map((row, rowNumber) =>
        row.map((cell, colNumber) => {
          const cellObj = new Cell(rowNumber, colNumber, cellSize);
          const el = getElementInCell(cell);
          if (el) {
            el.setCell(cellObj);
            this.elements.push(el);
          }
          cellObj.insertElement(el);
          return cellObj;
      }));
  }

  getElements():Element[] {
    return this.elements;
  }
  start() {

  }
}
