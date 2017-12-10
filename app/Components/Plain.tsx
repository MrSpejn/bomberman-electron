import * as React from 'react';
import {
  inject,
  observer,
} from 'mobx-react';

import { Bomberman } from '../Bomberman';
import { AppStore } from '../Store';

export interface props {
  appStore?: AppStore,
}

export interface state {
}

@inject('appStore')
@observer
export class Plain extends React.Component<props, state> {
  componentDidMount() {
    const bomberman = new Bomberman(this.props.appStore.connection);
    this.props.appStore.connection.on('connect', () => {
      console.log('Bomberman!!!');
      bomberman.start();
    });
  }
  render() {
    return (
      <canvas id="plain" width="1000" height="950" />
    );
  }
}