import { connect } from 'http2';
import {
  Player,
  Game,
} from '.';
import { Connection } from '../Network';

export class RemotelyControlled {
  player: Player;
  game: Game;

  constructor(player: Player, x: number, y: number, game: Game, connection: Connection) {
    this.player = player;
    this.game = game;
    player.positionX = x;
    player.positionY = y;

    connection.on(`player_${this.player.id}_move`, () => {

    });
  }
}
