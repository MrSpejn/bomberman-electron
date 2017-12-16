import * as React from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'

import { AppStore } from '../Store';


export interface props {
  appStore: AppStore,
}

export interface state {
}

@observer
export class NetworkMeta extends React.Component<props, state> {
  percentageIncommingDropChange = (value) => {
    this.props.appStore.setPercentageIncommingDrop(value);
  }

  percentageOutgoingDropChange = (value) => {
    this.props.appStore.setPercentageOutgoingDrop(value);
  }

  sendDelayChange = (value) => {
    this.props.appStore.setSendDelay(value);
  }

  receiveDelayChange = (value) => {
    this.props.appStore.setReceiveDelay(value);
  }

  render() {
    return (
      <div className="meta">
        <div className="percantage-incomming-drop">
          <p>Procent utraconych przychodzących</p>
          <Slider
            min={0}
            max={100}
            onChange={this.percentageIncommingDropChange}
            value={this.props.appStore.networkMeta.percentageIncommingDrop}
          />
        </div>
        <div className="percantage-outgoing-drop">
          <p>Procent utraconych wychodzących</p>
          <Slider
            min={0}
            max={100}
            onChange={this.percentageOutgoingDropChange}
            value={this.props.appStore.networkMeta.percentageOutgoingDrop}
          />
        </div>
        <div className="send-delay">
          <p>Opóźnienie wysłania</p>
          <Slider
            min={0}
            max={500}
            onChange={this.sendDelayChange}
            value={this.props.appStore.networkMeta.sendDelay}
          />
        </div>
        <div className="receive-delay">
          <p>Opóźnienie odebrania</p>
          <Slider
            min={0}
            max={500}
            onChange={this.receiveDelayChange}
            value={this.props.appStore.networkMeta.receiveDelay}
          />
        </div>
      </div>
    );
  }
}
