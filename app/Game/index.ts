import {
  Cell,
  getElementInCell,
} from './Cell';
import {
  Element,
  Bomb,
  Fire,
  Crate,
  Debris,
} from './Element';
import { Player } from './Player';


export * from './Cell';
export * from './Element';
export * from './Player';
export * from './LocallyControlled';
export * from './RemotelyControlled';

export class Game {
  map: Cell[][];
  elements: Element[] = [];
  players: Player[] = [];
  bombs: Bomb[] = [];
  fires: Fire[] = [];
  debris: Debris[] = [];

  constructor(stage, cellSize) {
    this.loadMap(stage, cellSize);
  }

  getElements():Element[] {
    return this.elements;
  }

  getPlayers():Player[] {
    return this.players;
  }

  setPlayers(players: Player[]) {
    this.players = players;
  }

  loadMap(stage, cellSize) {
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

  update(timeDiff: number) {
    this.checkBombs();
    this.checkFires();
    this.checkDebris();
  }

  checkBombs() {
    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];
      if (bomb.shouldExplode()) {
        bomb.explode(this);
      }
    }
  }

  checkDebris() {
    for (let i = 0; i < this.debris.length; i++) {
      const debris = this.debris[i];
      if (debris.shouldBeRemoved()) {
        this.removeDebris(debris);
      }
    }
  }

  checkFires() {
    for (let i = 0; i < this.fires.length; i++) {
      const fire = this.fires[i];
      if (fire.isOver()) {
        this.removeFire(fire);
      }
    }
  }

  placeBomb(posX, posY, player:Player) {
    const size = this.map[0][0].cellSize;
    const crow = Math.floor(posY / size);
    const ccol = Math.floor(posX / size);

    const bomb = new Bomb([player]);
    if (this.map[crow][ccol].getInsertedElement()) {
      return false;
    }
    bomb.setCell(this.map[crow][ccol]);
    this.bombs.push(bomb);
    this.map[crow][ccol].insertElement(bomb);
    return true;
  }

  removeBomb(bomb: Bomb) {
    bomb.getCell().insertElement(null);
    const idx = this.bombs.indexOf(bomb);
    if (idx !== -1) {
      this.bombs.splice(idx, 1);
    }
  }

  removeFire(fire: Fire) {
    fire.getCell().insertElement(null);
    const idx = this.fires.indexOf(fire);
    if (idx !== -1) {
      this.fires.splice(idx, 1);
    }
  }

  removeDebris(debris: Debris) {
    debris.getCell().insertElement(null);
    const idx = this.debris.indexOf(debris);
    if (idx !== -1) {
      this.debris.splice(idx, 1);
    }
  }

  destroyCrate(crate: Crate) {
    const cell = crate.getCell();
    const idx = this.elements.indexOf(crate);
    if (idx !== -1) {
      this.elements.splice(idx, 1);
    }
    const debris = new Debris();
    cell.insertElement(debris);
    debris.setCell(cell);
    this.debris.push(debris);

  }

  placeFire(cell: Cell) {
    const fire = new Fire();
    fire.setCell(cell);
    this.fires.push(fire);
    cell.insertElement(fire);
  }
}
