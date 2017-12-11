import * as React from 'react';

export interface props {
  ping: number,
}

export interface state {
}

export class Ping extends React.Component<props, state> {
  parsePing() {
    if (this.props.ping < 0) return 'Disconnected';
    else return this.props.ping;
  }
  parsePingClassName() {
    const ping = this.props.ping;
    if (ping < 0) return '';
    if (ping < 40) return 'ping-box--good';
    if (ping < 100) return 'ping-box--nice';
    if (ping < 150) return 'ping-box--medium';
    if (ping < 200) return 'ping-box--bad';

    return 'ping-box--critical';
  }

  render() {
    return (
      <div className={`ping-box ${this.parsePingClassName()}`}>
        {this.parsePing()}
      </div>
    );
  }
}
