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
    if (!local.isAlive) {
      return (
        <div className="overlay__container">
          <div className="overlay">
            <p className="overlay__text">You died</p>
          </div>
        </div>
      );
    }
    return (
      <div />
    );
  }
}
