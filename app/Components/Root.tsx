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

export interface props {
  appStore?: AppStore,
}

export interface state {
  nick: string,
  dashboard: boolean,
  game: boolean,
  map: string,
}

@inject('appStore')
@observer
export class Root extends React.Component<props, state> {
  constructor(props) {
    super(props);

    this.state = {
      nick: '',
      dashboard: false,
      game: false,
      map: '',
    };

    this.onJoinRequest = this.onJoinRequest.bind(this);
    autorun(() => {
      if (props.appStore.reconnnect) {
        this.onJoinRequest({ nick: props.appStore.reconnnect });
      }
    });
  }

  onJoinRequest({ nick }) {
    this.setState({ nick }, () => {
      this.props.appStore.connection.connect(`pr${nick.length}:${nick}`);

      const onConnect = () => {
        this.props.appStore.connection.off('connect', onConnect);
        this.setState({ dashboard: true });
      };

      const onStatus = (status) => {
        if (!this.state.game && status.started) {
          this.setState({
            dashboard: false,
            game: true,
          });
        }
      };

      const onMap = (map) => {
        this.props.appStore.connection.off('map', onMap);
        this.setState({
          map,
        });
      };

      this.props.appStore.connection.on('connect', onConnect);

      this.props.appStore.connection.on('game_status', onStatus);

      this.props.appStore.connection.on('map', onMap);
    });
  }

  render() {
    return (
      <div className="root">
        <Dialog
          onSubmit={this.onJoinRequest}
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

