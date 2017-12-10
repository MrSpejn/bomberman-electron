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
} from './';
import { AppStore } from '../Store';

export interface props {
  appStore?: AppStore,
}

export interface state {
  nick: string,
  dashboard: boolean,
  game: boolean,
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
    };

    this.onJoinRequest = this.onJoinRequest.bind(this);
  }

  onJoinRequest({ nick }) {
    this.setState({ nick }, () => {
      this.props.appStore.connection.connect(`pr${nick.length}:${nick}`);
      this.props.appStore.connection.on('connect', () => {
        this.setState({ dashboard: true });
      });
      this.props.appStore.connection.on('game_status', (status) => {
        if (!this.state.game && status.started) {
          this.setState({
            dashboard: false,
            game: true,
          });
        }
      });
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
        {this.state.dashboard && <Dashboard />}
        {this.state.game && <Plain />}
      </div>
    );
  }
}

