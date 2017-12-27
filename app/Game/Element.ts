import * as timers from 'timers';

import { observable } from 'mobx';

import { Cell } from './Cell';
import { Player } from './Player';
import { Game } from '.';

export class Element {
  cell: Cell;
  graphicalRepresentation: any;
  @observable state;
  collideable: boolean;

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

  isCollideable() {
    return this.collideable;
  }

  playerContact(player: Player) {
    return;
  }

  playerLostContact(player: Player) {
    return;
  }

  allowPlayer(player: Player) {
    return false;
  }
}

export class Debris extends Element {
  timeout: number = 500;
  start: number;
  constructor() {
    super();
    this.start = (new Date).getTime();
  }
  shouldBeRemoved() {
    return ((new Date).getTime() - this.start) > this.timeout;
  }
}

export class Wall extends Element {
  constructor() {
    super();
    this.collideable = true;
  }
}

export class Crate extends Element {
  constructor() {
    super();
    this.collideable = true;
  }
}

export class Bomb extends Element {
  allowed: Player[] = [];
  explosionTime: number;
  size: number = 3;

  constructor(onCellDuringDeploy: Player[], power, explosionTime?: number) {
    super();
    this.collideable = true;
    this.allowed = onCellDuringDeploy;
    this.size = power;
    this.explosionTime = explosionTime || (new Date()).getTime() + 2000;
  }

  explode(game: Game) {
    const cell = this.getCell();
    const map = game.map;
    const row = cell.row;
    const col = cell.col;

    game.removeBomb(this);
    game.placeFire(cell);

    for (let i = 1; i <= this.size; i++) {
      if (col + i >= map[0].length) break;
      if (!this._explosion(map[row][col + i], game)) break;
    }
    for (let i = 1; i <= this.size; i++) {
      if (col - i < 0) break;
      if (!this._explosion(map[row][col - i], game)) break;
    }
    for (let i = 1; i <= this.size; i++) {
      if (row + i >= map.length) break;
      if (!this._explosion(map[row + i][col], game)) break;
    }
    for (let i = 1; i <= this.size; i++) {
      if (row - i < 0) break;
      if (!this._explosion(map[row - i][col], game)) break;
    }
  }

  _explosion(cell: Cell, game: Game) {
    const inserted:Element = cell.getInsertedElement();
    if (!inserted) {
      game.placeFire(cell);
      return true;
    }
    // if (inserted instanceof Crate) {
    //   game.destroyCrate(<Crate> inserted);
    // } else
    if (inserted instanceof Fire && (<Fire> inserted).isInactive()) {
      game.removeFire(<Fire> inserted);
      game.placeFire(cell);
    }
    return false;
  }

  shouldExplode() {
    return this.explosionTime < (new Date()).getTime();
  }

  playerContact(player: Player) {
    return;
  }

  playerLostContact(player: Player) {
    const idx = this.allowed.indexOf(player);
    if (idx !== -1) {
      this.allowed.splice(idx, 1);
    }
  }

  allowPlayer(player: Player) {
    return this.allowed.indexOf(player) !== -1;
  }
}

export class Fire extends Element {
  activeTime: number = 1100;
  timeout: number = 1500;
  start: number;

  constructor() {
    super();
    this.start = (new Date).getTime();
  }

  isOver() {
    return ((new Date).getTime() - this.start) > this.timeout;
  }
  isInactive() {
    return ((new Date).getTime() - this.start) > this.activeTime;
  }
}

