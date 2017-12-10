import { connect } from 'net';
import {
  observable,
  action,
} from 'mobx';
import { Connection } from '../Network';

export class AppStore {
  connection: Connection;
  @observable ping: number = -1;
  constructor(connection: Connection) {
    this.connection = connection;
    connection.on('ping', action((ping) => {
      this.ping = <number>ping;
    }));
  }
};
