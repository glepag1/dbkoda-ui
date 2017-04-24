/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T11:38:53+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-24T11:02:51+10:00
*/

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { reaction, runInAction } from 'mobx';
import Store from '~/stores/global';
import { Intent, Position } from '@blueprintjs/core';
import { featherClient } from '../../helpers/feathers';
import { DBenvyToaster } from '../common/Toaster';
import TreeState from './model/TreeState.js';
import TreeToolbar from './Toolbar.jsx';
import TreeView from './View.jsx';

@inject('store')
@observer
export default class TreePanel extends React.Component {
  static get defaultProps() {
    return {
      store: undefined,
    };
  }
  constructor(props) {
    super(props);
    if (this.props.store.topology.json !== null) {
      this.treeState.parseJson(this.props.store.topology.json);
    }
  }
  componentWillMount() {
    /**
     * Reaction to change in selected Profile from the profile pane
     * @param  {function} this - condition to react on change
     * @param  {function} if   - Reaction callback Function
     */
    reaction(
      () => this.props.store.profileList.selectedProfile,
      () => {
        if (this.props.store.profileList.selectedProfile) {
          this.treeState.setProfileAlias(this.props.store.profileList.selectedProfile.alias);
          const service = featherClient()                 // Calls the controller to load the topology associated with the selected Profile
            .service('/mongo-inspector');
            service.timeout = 60000;
            service.get(this.props.store.profileList.selectedProfile.id)
            .then((res) => {
              console.log('treeJson:', res);
              this.props.store.updateTopology(res);
            })
            .catch((err) => {
              console.log(err.stack);
              DBenvyToaster(Position.LEFT_BOTTOM).show({
                message: err.message,
                intent: Intent.DANGER,
                iconName: 'pt-icon-thumbs-down',
              });
            });
        }
      },
    );
    /**
     * Reaction to update tree when topology is changed
     * @param  {function} this Condition to react on changed
     * @param  {function} if   Reaction callback function
     */
    reaction(
      () => this.props.store.topology.isChanged,
      () => {
        if (this.props.store.topology.isChanged && this.props.store.topology.json !== null) {
          this.treeState.parseJson(this.props.store.topology.json);
          runInAction('update topology isChanged', () => {
            this.props.store.topology.isChanged = false;
          });
        }
      },
    );
  }
  treeState = new TreeState();

  render() {
    const divStyle = {
      height: '100%',
    };
    return (
      <Provider treeState={this.treeState}>
        <div style={divStyle}>
          <TreeToolbar />
          <TreeView />
        </div>
      </Provider>
    );
  }
}

TreePanel.propTypes = {
  store: React.PropTypes.instanceOf(Store),
};
