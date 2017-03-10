/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-10T17:36:52+11:00
*/

import React from 'react';
import { shallow } from 'enzyme';
import { observable, useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import renderer from 'react-test-renderer';
import App from '#/App';
import Store from '~/stores/global';

describe('App', () => {
  let app;
  const layout = observable({
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  });

  beforeAll(() => {
    useStrict(true);

    app = shallow(<App.wrappedComponent layout={layout} />);
  });

  test('has a drawer', () => {
    expect(app.find('Drawer').length).toEqual(1);
  });

  test('has 3 split panels', () => {
    expect(app.find('SplitPane').length).toEqual(3);
  });

  test('matches snapshot', () => {
    const store = new Store();

    const tree = renderer
      .create(
        <Provider store={store}>
          <App />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
