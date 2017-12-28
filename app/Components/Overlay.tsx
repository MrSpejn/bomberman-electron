import * as React from 'react';
import {
  inject,
  observer,
} from 'mobx-react';

import { AppStore } from '../Store';

export interface props {
  appStore?: AppStore,
}

export interface state {
}

@inject('appStore')
@observer
export class Overlay extends React.Component<props, state> {
  render() {
    const status = this.props.appStore.gameStatus;
    const local = status.players.find(player => player.id === status.localId);
    const allDead = !status.players.some(player => player.id !== status.localId && player.isAlive);
    if (!local.isAlive || allDead) {
      return (
        <div className="overlay__container">
          <div className="overlay">
            <p className={`overlay__text ${!local.isAlive ? 'overlay__text--failure' : ''}`}>
              {!local.isAlive ? "You died" : "You won!"}
            </p>
          </div>
          <button
            className="overlay__reconnect ui primary button"
            onClick={() => this.props.appStore.replay()}
          >
            Replay
          </button>
        </div>
      );
    }
    return (
      <div />
    );
  }
}
