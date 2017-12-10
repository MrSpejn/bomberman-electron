import * as React from 'react';
import {
  inject,
  observer,
} from 'mobx-react';

import { AppStore } from '../Store';
import { Ping } from './';

export interface props {
  appStore?: AppStore,
}

export interface state {
}

@inject('appStore')
@observer
export class Stats extends React.Component<props, state> {
  render() {
    return (
      <div className="stats">
        <Ping ping={this.props.appStore.ping} />
      </div>
    );
  }
}
