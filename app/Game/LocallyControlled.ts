import {
  Connection,
  Outgoing,
} from '../Network';
import { Game } from '.';
import { Player } from './Player';
import { Cell } from './Cell';
import { Bomb } from './Element';

const KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
export class LocallyControlled {
  player: Player;
  game: Game;
  id: number;
  stopped: boolean = false;
  keyPressed = {
    ArrowDown: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
  lastClicked: string;
  connection: Connection;

  constructor(player: Player, x: number, y: number, game: Game, connection: Connection) {
    this.player = player;
    this.game = game;
    player.positionX = x;
    player.positionY = y;
    this.connection = connection;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);

    document.addEventListener('keydown', this.onKeyDown);

    document.addEventListener('keyup', this.onKeyUp);

    document.addEventListener('keypress', this.onKeyPress);

    const handler = (players, time) => {
      const local = players.find(player => player.id === this.player.id);
      if (local) {
        player.positionX = local.x;
        player.positionY = local.y;
      }
    }

    connection.on('players', handler);
  }

  stop() {
    this.stopped = true;
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('keypress', this.onKeyPress);
    this.keyPressed = {
      ArrowDown: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowRight: false,
    };
  }

  onKeyDown(event) {
    if (KEYS.includes(event.key)) {
      this.keyPressed[event.key] = true;
      this.lastClicked = event.key;
    }
  }

  onKeyPress(event) {
    if (event.key === ' ') {
      const success = this.game.placeBomb(this.player.positionX, this.player.positionY, this.player);
      if (success) {
        this.connection.dispatchUntilAcknowledge(Outgoing.BOMB, {
          id: this.player.id,
          x: success.getCell().col,
          y: success.getCell().row,
        });
      }
    }
  }

  onKeyUp(event) {
    if (KEYS.includes(event.key)) {
      this.keyPressed[event.key] = false;
    }
  }

  setPosition(x, y, map) {
    const size = map[0][0].cellSize;

    const pcX = Math.floor(this.player.positionX / size);
    const pcY = Math.floor(this.player.positionY / size);

    const cellX = Math.floor(x / size);
    const cellY = Math.floor(y / size);

    this.player.positionX = x;
    this.player.positionY = y;

    if (pcX !== cellX || pcY !== cellY) {
      const pCell = map[pcY][pcX];
      const nCell = map[cellX][cellY];
      pCell.playerLeave(this.player);
      nCell.playerEnter(this.player);
    }
  }

  updatePositionStandard(dx, dy, map: Cell[][]) {
    const x = this.player.positionX + dx;
    const y = this.player.positionY + dy;
    const size = map[0][0].cellSize;
    const marginHor = this.player.width / 2;
    const marginVer = this.player.height / 2;

    const cellX = Math.floor(x / size);
    const cellY = Math.floor(y / size);
    const halfSize = size / 2;

    const cells = [
      map[cellY][cellX],
      dx >= 0 && cellX < map[0].length-1 && map[cellY][cellX+1],
      dy >= 0 && cellY < map.length-1 && map[cellY+1][cellX],
      dy <= 0 && cellY > 0 && map[cellY-1][cellX],
      dx <= 0 && cellX > 0 && map[cellY][cellX-1],
    ];
    const filled = cells.filter(cell => cell && cell.isCollideable());

    if (!filled.some(cell => {
      const marginH = marginHor;
      const marginV = marginVer;

      if (cell.getInsertedElement().allowPlayer(this.player)) {
        return false;
      }
      return ((
        cell.centerX + halfSize + marginH >= x &&
        cell.centerX - halfSize - marginH <= x
      ) && (
        cell.centerY + halfSize + marginV >= y &&
        cell.centerY - halfSize - marginV <= y
      ));
    })) {
      const pcX = Math.floor(this.player.positionX / size);
      const pcY = Math.floor(this.player.positionY / size);
      this.player.positionX = x;
      this.player.positionY = y;

      if (pcX !== cellX || pcY !== cellY) {
        const pCell = map[pcY][pcX];
        const nCell = map[cellX][cellY];
        pCell.playerLeave(this.player);
        nCell.playerEnter(this.player);
      }

      this.connection.dispatch(Outgoing.MOVE, this.player.id, { x, y });



    }
  }

  updatePosition(dx, dy, map) {
    const x = this.player.positionX + dx;
    const y = this.player.positionY + dy;
    const marginHor = this.player.width / 2;
    const marginVer = this.player.height / 2;
    const size = map[0][0].cellSize;

    if (dx === 0) {
      const cellX = Math.floor(x / size);
      let cellY;
      if (dy > 0) {
        const cellY = Math.floor((y + marginVer) / size);
        if (cellY >= map.length) {
          this.player.positionX = x;
          this.player.positionY = (map.length) * size - marginVer;
        } else {
          this.updatePositionStandard(dx, dy, map);
        }

      } else {
        const cellY = Math.floor((y - marginVer) / size);
        if (cellY < 0) {
          this.player.positionX = x;
          this.player.positionY = marginVer;
        }
        else {
          this.updatePositionStandard(dx, dy, map);
        }
      }
    }
    else {
      const cellY = Math.floor(y / size);
      if (dx > 0) {
        const cellX = Math.floor((x + marginHor) / size);
        if (cellX >= map[0].length) {
          this.player.positionX = (map.length) * size - marginHor;
          this.player.positionY = y;
        }
        else {
          this.updatePositionStandard(dx, dy, map);
        }
      } else {
        const cellX = Math.floor((x - marginHor) / size);
        if (cellX < 0) {
          this.player.positionX = marginHor;
          this.player.positionY = y;
        }
        else {
          this.updatePositionStandard(dx, dy, map);
        }
      }
    }
  }

  update(timeDiff: number) {
    if (this.stopped) return;
    const direction = this.keyPressed[this.lastClicked] ? this.lastClicked : KEYS.find(key => this.keyPressed[key]);
    if (!direction) {
      const [activity, prevDir] = this.player.state.animation.split('_');
      this.player.state.animation = `stay_${prevDir}`;
      this.connection.dispatch(Outgoing.MOVE, 'u');
    } else {
      const a = direction.slice(5).toLowerCase();
      switch (a) {
        case 'down': {
          this.player.state.animation = 'walk_front';
          this.connection.dispatch(Outgoing.MOVE, 's');
          break;
        }
        case 'up': {
          this.player.state.animation = 'walk_back';
          this.connection.dispatch(Outgoing.MOVE, 'w');
          break;
        }
        case 'left': {
          this.player.state.animation = 'walk_left';
          this.connection.dispatch(Outgoing.MOVE, 'a');
          break;
        }
        case 'right': {
          this.player.state.animation = 'walk_right';
          this.connection.dispatch(Outgoing.MOVE, 'd');
          break;
        }
      }
    }
  }
}
