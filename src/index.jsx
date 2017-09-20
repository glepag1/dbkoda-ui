/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
  * @Author: Wahaj Shamim <wahaj>
  * @Date:   2017-07-13T10:36:10+10:00
  * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-26T13:48:06+10:00
  */

import Store from '~/stores/global';
import DataCenter from '~/api/DataCenter';
import React from 'react';
import ReactDOM from 'react-dom';
import mobx, { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import { Broker, EventType } from './helpers/broker';
import App from './components/App';

useStrict(true);

const rootEl = document.getElementById('root');

let store;
let api;

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const renderApp = () => {
  if (store) {
    console.log('Last Store Version:', store.version);
    // if (!store.version) {
    //   store = new Store();
    //   api = new DataCenter(store);
    //   store.setAPI(api);
    // }
    // else if (store.version != global.version) {  // Have to define and read the version from global variables

    // }
  }
  const render = (Component) => {
    ReactDOM.render(
      <AppContainer>
        <Provider store={store} api={api}>
          <Component />
        </Provider>
      </AppContainer>,
      rootEl,
    );
  };

  render(App);
  // Hot Module Replacement API
  if (module.hot) {
    module.hot.accept('./components/App', () => {
      render(App);
    });
  }

  if (IS_ELECTRON) {
    ipcRenderer.send(EventType.APP_READY);
  }
};

Broker.once(EventType.APP_READY, renderApp);

Broker.once(EventType.APP_RENDERED, () => {
  console.log('App Rendered successfully !!!!!!!');
});

Broker.once(EventType.APP_CRASHED, () => {
  console.log('Woah...App Crashed !!!!!!!');
  if (IS_ELECTRON) {
    // make a backup of the old stateStore
    store.backup().then(() => {
      store = new Store();
      api = new DataCenter(store);
      store.setAPI(api); // TODO: Remove this line after complete migration to API
      store.saveSync();
      ipcRenderer.send(EventType.APP_CRASHED);
    }).catch((err) => {
      const remote = window.require('electron').remote;
      const { dialog } = remote;
      const currentWindow = remote.getCurrentWindow();

      dialog.showMessageBox(currentWindow, {
        title: 'Error',
        message:
          err.message,
      });
    });
  }
});

window.addEventListener('beforeunload', (event) => {
  let shouldUnmount = true;

  if (IS_ELECTRON) {
    const remote = window.require('electron').remote;
    const { dialog } = remote;
    const currentWindow = remote.getCurrentWindow();

    if (!remote.getGlobal('UAT') && store.hasUnsavedEditorTabs()) {
      const response = dialog.showMessageBox(currentWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message:
          'You have unsaved editor tabs. Are you sure you want to continue?',
      });

      if (response === 1) {
        // if 'No' is clicked

        // cancel window unload
        event.returnValue = false;
        // cancel our own unload logics
        shouldUnmount = false;
      }
    }
  }

  if (shouldUnmount) {
    store.closeConnection();
    ReactDOM.unmountComponentAtNode(rootEl);
  }

  // save store anyway
  store.saveSync();
});

store = new Store();
api = new DataCenter(store);
store.setAPI(api); // TODO: Remove this line after complete migration to API
window.api = api;
window.store = store;
window.mobx = mobx;
