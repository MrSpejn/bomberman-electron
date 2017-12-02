import {
  Element,
  Wall,
  Crate,
} from './Element';

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

export function getElementInCell(type: number):Element {
  switch(type) {
    case 0: return null;
    case 1: return new Wall();
    //case 2: return new Crate();
    default: return null;
  }
}