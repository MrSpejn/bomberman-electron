import * as React from 'react';
import { AppStore } from '../Store';
import {
  inject,
  observer,
} from 'mobx-react';

export interface props {
  appStore?: AppStore,
}

export interface state {
}


@inject('appStore')
@observer
export class Header extends React.Component<props, state> {
  render() {
    const local = this.props.appStore.gameStatus.players.find(player => player.id === this.props.appStore.gameStatus.localId);
    return (
      <div className="header">
        <h2 className="header__nick">{local ? local.nick : ''}</h2>
      </div>
    );
  }
}
