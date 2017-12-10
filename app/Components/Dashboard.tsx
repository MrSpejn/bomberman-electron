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
export class Dashboard extends React.Component<props, state> {
  renderPlayer(player) {
    return (
      <div className={`player ${player.id === this.props.appStore.gameStatus.localId ? 'player--local' : ''}`}>
        <img
          className="player__image"
          src="./images/orkin.png"
          width="200"
        />
        <p className={`player__name ${!player.connected ? 'player__name--await' : ''}`}>
          { player.connected ? player.nick : 'Not connected' }
        </p>
      </div>
    )
  }

  render() {
    return (
      <div className="dashboard">
        <ul className="dashboard__players">
          {this.props.appStore.gameStatus.players.map((player, idx) => (
            <li key={idx} className="dashboard__players-item">
              {this.renderPlayer(player)}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
