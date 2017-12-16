import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import { AppStore } from './Store';
import { Connection } from './Network';
import { Root } from './Components';

import 'semantic-ui-css/semantic.min.css';

import './style.scss';

const connection = new Connection('localhost', 1234);
const appStore = new AppStore(connection);
connection.setNetworkMeta(appStore.networkMeta);

ReactDOM.render((
  <Provider appStore={appStore}>
    <Root />
  </Provider>
), document.querySelector('#root'));
