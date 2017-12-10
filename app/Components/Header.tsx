import * as React from 'react';
import { AppStore } from '../Store';

export interface props {
  appStore?: AppStore,
}

export interface state {
}

export class Header extends React.Component<props, state> {
  render() {
    return (
      <div className="header">

      </div>
    );
  }
}
