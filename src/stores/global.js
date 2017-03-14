/**
 * @Author: guiguan
 * @Date:   2017-03-07T18:37:59+11:00
* @Last modified by:   chris
* @Last modified time: 2017-03-10T13:12:00+11:00
 */

import { observable, computed } from 'mobx';
import TempTopology from './TempTopology.js';

export default class Store {
  @observable profiles = observable.map();
  @observable editors = observable.map();
  @observable activeEditorId = 0;
  @observable activeDropdownId = 'Default';
  @observable executingEditorAll = false;
  @observable executingEditorLines = false;
  @observable layout = {
    drawerOpen: false,
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  };
  @observable output = {
      output: '// Output goes here!',
      canShowMore: true,
  }

  @computed get topology() { // eslint-disable-line
    // this.getTopologyFromProfile()

    return TempTopology.data;
  }
}
