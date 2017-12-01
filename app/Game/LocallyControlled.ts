import { Game } from '.';
import { Player } from './Player';
import { Cell } from './Cell';

const KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
export class LocallyControlled {
  player: Player;
  game: Game;
  keyPressed = {
    ArrowDown: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
  };
  lastClicked: string;

  constructor(player: Player, x: number, y: number) {
    this.player = player;
    player.positionX = x;
    player.positionY = y;

    document.addEventListener('keydown', (event) => {
      if (KEYS.includes(event.key)) {
        this.keyPressed[event.key] = true;
        this.lastClicked = event.key;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (KEYS.includes(event.key)) {
        this.keyPressed[event.key] = false;
      }
    });
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
      cellX < map[0].length-1 && map[cellY][cellX+1],
      cellY < map.length-1 && map[cellY+1][cellX],
      cellY > 0 && map[cellY-1][cellX],
      cellX > 0 && map[cellY][cellX-1],
    ]
    const filled = cells.filter(cell => cell && cell.getInsertedElement());

    if (!filled.some(cell => {
      return ((
        cell.centerX + halfSize + marginHor >= x &&
        cell.centerX - halfSize - marginHor <= x
      ) && (
        cell.centerY + halfSize + marginVer >= y &&
        cell.centerY - halfSize - marginVer <= y
      ));
    })) {
      this.player.positionX = x;
      this.player.positionY = y;
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

  update(timeDiff: number, game: Game) {
    const direction = this.keyPressed[this.lastClicked] ? this.lastClicked : KEYS.find(key => this.keyPressed[key]);
    if (!direction) {
      const [activity, prevDir] = this.player.state.animation.split('_');
      this.player.state.animation = `stay_${prevDir}`;
    } else {
      const a = direction.slice(5).toLowerCase();
      switch (a) {
        case 'down': {
          this.player.state.animation = 'walk_front';
          this.updatePosition(0, timeDiff / 1000 * 200, game.map);
          break;
        }
        case 'up': {
          this.player.state.animation = 'walk_back';
          this.updatePosition(0, -1 * timeDiff / 1000 * 200, game.map);
          break;
        }
        case 'left': {
          this.player.state.animation = 'walk_left';
          this.updatePosition(-1 * timeDiff / 1000 * 200, 0, game.map);

          break;
        }
        case 'right': {
          this.player.state.animation = 'walk_right';
          this.updatePosition(timeDiff / 1000 * 200, 0, game.map);
          break;
        }
      }
    }
  }
}
