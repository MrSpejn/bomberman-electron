import * as React from 'react';
import { AppStore } from '../Store';

import {
  Modal,
  Form,
  Message,
} from 'semantic-ui-react';

export interface props {
  onSubmit: ({ nick: string }) => void,
  open: boolean,
}

export interface state {
  error: string,
}

export class Dialog extends React.Component<props, state> {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();
    const nick = event.target.nick.value;
    if (nick) {
      this.props.onSubmit({ nick });
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
            <h3 className='dialog__title'>Rozpocznij grę</h3>
            <Form.Field>
              <label>Nick:</label>
              <input name='nick' />
            </Form.Field>
            {this.state.error && (
              <Message negative>
                {this.state.error}
              </Message>
            )}
            <div>
              <Form.Button type='submit'>Połącz</Form.Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
