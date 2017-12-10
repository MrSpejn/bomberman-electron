import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import { AppStore } from './Store';
import { Connection } from './Network';
import { Root } from './Components';

import 'semantic-ui-css/semantic.min.css';

import './style.scss';

const connection = new Connection('localhost', 1234);

ReactDOM.render((
  <Provider appStore={new AppStore(connection)}>
    <Root />
  </Provider>
), document.querySelector('#root'));
