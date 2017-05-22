/**
 * @Author: joey
 * @Date:   2017-05-15T16:33:48+10:00
 * @Email:  joey@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T12:47:31+10:00
 */

import uuidV1 from 'uuid';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';
import {observable, useStrict} from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import Store from '../../../stores/global';
import {EditorPanel} from '../index.js';

describe('Editor State Tests', () => {
  beforeAll(() => {
    useStrict(true);
    globalizeInit();
  });

  test('checked tabs with editors in store', () => {
    const store = new Store();
    const editorId1 = uuidV1();
    store.editors.set(editorId1, observable({
      id: editorId1,
      alias: 'alias-1',
      profileId: uuidV1(),
      shellId: uuidV1(),
      currentProfile: uuidV1(),
      visible: true,
      executing: false,
      initialMsg: '',
      code: '',
      path: null
    }));
    const editorId2 = uuidV1();
    store.editors.set(editorId2, observable({
      id: editorId2,
      alias: 'alias-2',
      profileId: uuidV1(),
      shellId: uuidV1(),
      currentProfile: uuidV1(),
      visible: true,
      executing: false,
      initialMsg: '',
      code: '',
      path: null
    }));
    const editor = shallow(<EditorPanel.wrappedComponent store={store} />);
    expect(editor.find('.editorPanel')).to.have.length(1);
    expect(editor.find('.editorPanel .editorTab')).to.have.length(2);
    const tabs = editor.find('.editorPanel .editorTab');
    expect(tabs).to.have.length(2);
  });
});
