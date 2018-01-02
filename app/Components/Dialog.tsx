import { PendingMap } from './Root';
import * as React from 'react';
import { AppStore } from '../Store';

import {
  Modal,
  Form,
  Message,
} from 'semantic-ui-react';

export interface props {
  onSubmit: ({ nick: string, id: number }) => void,
  open: boolean,
  maps: PendingMap[],
}

export interface state {
  error: string,
}

export class Dialog extends React.Component<props, state> {
  input: HTMLInputElement;
  constructor(props) {
    super(props);

    this.state = {
      error: '',
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event, id) {
    event.preventDefault();
    const nick = this.input.value;
    if (nick) {
      this.props.onSubmit({ nick, id });
    } else {
      this.setState({ error: 'Niewłaściwa długość' });
    }
  }

  render() {
    return (
      <Modal
        size='small'
        basic
        open={this.props.open}
      >
        <Modal.Content>
          <Form
            className='dialog__form'
            onSubmit={this.onSubmit}
          >
            <Form.Field>
              <label>Nick:</label>
              <input
                ref={(input) => { this.input = input }}
                name='nick'
              />
            </Form.Field>
            {this.state.error && (
              <Message negative>
                {this.state.error}
              </Message>
            )}
            <ul className="dialog__maps">
              {this.props.maps.map((map) => (
                <li className="dialog__map-record">
                  <p>{map.name}</p>
                  <p>{map.currentPlayers}/{map.maxPlayers}</p>
                  <Form.Button
                    onClick={(event) => this.onSubmit(event, map.id)}
                  >
                    Połącz
                  </Form.Button>
                </li>
              ))}
            </ul>
            <h3 className='dialog__title'>Stwórz grę</h3>

            <div>
              <Form.Button type='submit'>Stwórz</Form.Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
