import { connect } from 'net';
import {
  observable,
  action,
} from 'mobx';
import { Connection } from '../Network';

export class AppStore {
  connection: Connection;
  @observable ping: number = -1;
  @observable gameStatus = {
    players: [],
  };

  constructor(connection: Connection) {
    this.connection = connection;
    connection.on('ping', action((ping) => {
      this.ping = <number>ping;
    }));
    connection.on('disconnect', action((ping) => {
      this.ping = -1;
    }));
    connection.on('game_status', action((status) => {
      this.gameStatus = status;
    }));
  }
};
