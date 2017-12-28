import * as React from 'react';
import {
  inject,
  observer,
} from 'mobx-react';

import { AppStore } from '../Store';
import {
  Ping,
  NetworkMeta,
} from './';

export interface props {
  appStore?: AppStore,
}

export interface state {
  showMeta: boolean;
}


@inject('appStore')
@observer
export class Stats extends React.Component<props, state> {
  constructor(props) {
    super(props);
    this.state = {
      showMeta: false,
    }
  }
  render() {
    return (
      <div className="stats">
        <Ping ping={this.props.appStore.ping} />
        <div onClick={() => this.setState({ showMeta: !this.state.showMeta })}>Toggle</div>
        {this.state.showMeta && (
          <NetworkMeta appStore={this.props.appStore} />
        )}
      </div>
    );
  }
}
