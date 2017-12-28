import * as React from 'react';
import range from 'lodash.range';
import {
  inject,
  observer,
} from 'mobx-react';

import { AppStore } from '../Store';
import { idToImage } from './Dashboard';

export interface props {
  appStore?: AppStore,
}

export interface state {
}


@inject('appStore')
@observer
export class Header extends React.Component<props, state> {
  renderPlayerInfo(player) {
    return (
      <div className="container">
        <p>{player.nick}</p>
        <img
          className="player__image"
          src={idToImage(player.id)}
          width="60"
        />
        <div className="header__player-lifes">
          {!player.isAlive ? (
            <img
              className="header__player-life"
              key="idx"
              src="../images/skull.png"
            />
          ) : range(player.lifes).map((idx) => (
            <img
              className="header__player-life"
              key={idx}
              src="../images/heart.png"
            />
          ))}
        </div>
      </div>
    );
  }
  render() {
    const status = this.props.appStore.gameStatus;
    const local = status.players.find(player => player.id === status.localId);
    return (
      <div className="header">
        {status.started ? (
          <ul className="header__players">
            <li
              key={local.id}
              className="header__player header__player--local"
            >{this.renderPlayerInfo(local)}</li>
            {status.players
              .filter((player) => player !== local)
              .map((player) => (
                <li
                  key={player.id}
                  className="header__player"
                >{this.renderPlayerInfo(player)}</li>
              )
            )}
          </ul>
        ) : (
          <h2 className="header__nick">{local ? local.nick : ''}</h2>
        )}
      </div>
    );
  }
}
