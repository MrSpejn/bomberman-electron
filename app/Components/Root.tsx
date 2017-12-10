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
} from './';
import { AppStore } from '../Store';

export interface props {
  appStore?: AppStore,
}

export interface state {
  nick: string,
}

@inject('appStore')
@observer
export class Root extends React.Component<props, state> {
  constructor(props) {
    super(props);

    this.state = {
      nick: '',
    };

    this.onJoinRequest = this.onJoinRequest.bind(this);
  }

  onJoinRequest({ nick }) {
    this.setState({ nick }, () => {
      this.props.appStore.connection.connect(`pr${nick.length}:${nick}`);
    });
  }

  render() {
    console.log(this.props.appStore);
    return (
      <div className="root">
        <Dialog
          onSubmit={this.onJoinRequest}
          open={!this.state.nick.length}
        />
        <Header />
        <Stats />
        <Plain />
      </div>
    );
  }
}

