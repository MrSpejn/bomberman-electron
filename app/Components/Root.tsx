import { autorun } from 'mobx';
import * as React from 'react';
import {
  inject,
  observer,
} from 'mobx-react';

import {
  Dialog,
  Header,
  Stats,
  Plain,
  Dashboard,
  Overlay,
} from './';
import { AppStore } from '../Store';
import { Outgoing } from '../Network/index';
import { GameStatus } from '../Store/AppStore';

export interface PendingMap {
  name: string,
  id: number,
  currentPlayers: number,
  maxPlayers: number,
}

export interface props {
  appStore?: AppStore,
}

export interface state {
  nick: string,
  dashboard: boolean,
  game: boolean,
  list: boolean,
  dialog: boolean,
  map: string,
  maps: PendingMap[],
}

@inject('appStore')
@observer
export class Root extends React.Component<props, state> {
  pendingMapsIntervals:number;
  constructor(props) {
    super(props);

    this.state = {
      nick: '',
      list: true,
      dialog: false,
      dashboard: false,
      game: false,
      map: '',
      maps: [],
    };

    this.onGame = this.onGame.bind(this);
    this.onStatus = this.onStatus.bind(this);
    this.onMap = this.onMap.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.props.appStore.connection.connect();
    }, 100);
    this.props.appStore.connection.on('connect', () => {
      this.props.appStore.connection.dispatch(Outgoing.MAPS);
      this.pendingMapsIntervals = window.setInterval(() => {
        this.props.appStore.connection.dispatch(Outgoing.MAPS);
      }, 1000);
    });
    this.props.appStore.connection.on('maps', (maps) => {
      this.setState({ maps });
    });
  }

  onStatus(status: GameStatus) {
    if (status.started) {
      this.setState({
        dashboard: false,
        game: true,
      });
      this.props.appStore.connection.off('game_status', this.onStatus);
    }
  }

  onMap(map) {
    this.setState({
      map,
    });
    this.props.appStore.connection.off('map', this.onMap);

  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.dashboard !== this.state.dashboard) {
      if (this.state.dashboard) {
        this.props.appStore.connection.on('game_status', this.onStatus);
        this.props.appStore.connection.on('map', this.onMap);
      }
    }
  }

  onGame({ nick, id }) {
    if (id && typeof id === 'number') {
      this.props.appStore.connection.dispatchUntilAcknowledge(Outgoing.JOIN_GAME, nick, id);
    } else {
      this.props.appStore.connection.dispatchUntilAcknowledge(Outgoing.CREATE_GAME, nick);
    }
    this.setState({
      nick: nick,
      dashboard: true,
      game: true,
    });

    clearInterval(this.pendingMapsIntervals);
  }

  render() {
    return (
      <div className="root">
        <Dialog
          maps={this.state.maps}
          onSubmit={this.onGame}
          open={!this.state.nick.length}
        />
        <Header />
        <Stats />
        {this.state.game && this.state.map && <Overlay />}
        {this.state.dashboard && <Dashboard />}
        {this.state.game && this.state.map && <Plain map={this.state.map} />}
      </div>
    );
  }
}

