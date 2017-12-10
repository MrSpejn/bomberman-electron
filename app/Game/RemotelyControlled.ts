import { platform } from 'os';
import { connect } from 'http2';
import {
  Player,
  Game,
} from '.';
import { Connection } from '../Network';

export class RemotelyControlled {
  player: Player;
  game: Game;
  lastMove: number;
  constructor(player: Player, x: number, y: number, game: Game, connection: Connection) {
    this.player = player;
    this.game = game;

    player.positionX = x;
    player.positionY = y;

    connection.on('players', (players) => {
      console.log(players);
      const remote = players.find(player => player.id === this.player.id);


      if (remote) {
        if (this.lastMove && (new Date).getTime() - this.lastMove > 100) {
          this.lastMove = null;
        }
        if (!this.lastMove && player.positionX === remote.x && player.positionY === remote.y) {
          const [activity, prevDir] = this.player.state.animation.split('_');
          this.player.state.animation = `stay_${prevDir}`;
        } else if (player.positionX !== remote.x || player.positionY !== remote.y) {
          const dx = player.positionX - remote.x;
          const dy = player.positionY - remote.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            this.player.state.animation = dx > 0 ? 'walk_left' : 'walk_right';
          } else {
            this.player.state.animation = dy > 0 ? 'walk_back' : 'walk_front';
          }
          this.lastMove = (new Date()).getTime();
        }

        player.positionX = remote.x;
        player.positionY = remote.y;
      }
    });
  }
}
