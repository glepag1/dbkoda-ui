/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T12:00:43+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-15T17:31:18+11:00
*/

import React from 'react';
import {inject, observer} from 'mobx-react';
import { Button, Menu, MenuItem, MenuDivider, Popover, Position } from '@blueprintjs/core';
import TreeState from './model/TreeState.js';

@inject('treeState')
@observer
export default class TreeToolbar extends React.Component {
  static get defaultProps() {
    return {
      treeState: undefined
    };
  }
  constructor(props) {
    super(props);

    this.updateFilter = this.updateFilter.bind(this);
  }
  updateFilter(event) {
    const value = event.target.value.replace(/ /g, '');
    this.props.treeState.setFilter(value);
  }
  render() {
    const menu = (
      <Menu className="pt-dark">
        <MenuItem text="New" />
        <MenuItem text="Open" />
        <MenuItem text="Save" />
        <MenuDivider />
        <MenuItem text="Settings..." />
      </Menu>
    );
    return (
      <nav className="pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">DBEnvy</div>
          <input className="pt-input" placeholder="Search..." type="text" onChange={this.updateFilter} />
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Popover content={menu} position={Position.BOTTOM_RIGHT}>
            <Button text="Actions" />
          </Popover>
        </div>
      </nav>
    );
  }
}

TreeToolbar.propTypes = {
  treeState: React.PropTypes.instanceOf(TreeState)
};