/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T09:24:34+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-29T11:41:37+11:00
 *
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

import React from 'react';
import { inject, observer, Provider } from 'mobx-react';
import { action, untracked } from 'mobx';
import SplitPane from 'react-split-pane';
import { Button } from '@blueprintjs/core';

import { ProfileListPanel } from '#/ProfileListPanel';
import { TreePanel } from '#/TreePanel';
import TreeState from '#/TreePanel/model/TreeState.js';
// import { ConnectionProfilePanel } from '#/ConnectionPanel';
import { AggregateLeftPanel } from '#/AggregateViews';
import { TreeActionPanel } from '#/TreeActionPanel';
import { DrawerPanes } from '#/common/Constants';
import { BackupRestore } from '../BackupRestore/index';

import './Panel.scss';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column',
};

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout,
  drawer: allStores.store.drawer,
}))
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action.bound
  updateLeftSplitPos(pos) {
    this.props.layout.leftSplitPos = pos;
  }

  @action.bound
  updateAndRestart() {
    this.props.store.updateAndRestart();
  }

  treeState = new TreeState();
  render() {
    const { layout, drawer } = this.props;
    let defaultLeftSplitPos;

    untracked(() => {
      defaultLeftSplitPos = layout.leftSplitPos;
    });

    return (
      <div>
        <div className="leftPaneInnerWrapper">
          {drawer.drawerChild == DrawerPanes.DEFAULT && (
            <SplitPane
              className="LeftSplitPane"
              split="horizontal"
              defaultSize={defaultLeftSplitPos}
              onDragFinished={this.updateLeftSplitPos}
              minSize={100}
              maxSize={1000}
              pane2Style={splitPane2Style}
            >
              <ProfileListPanel />
              <Provider treeState={this.treeState}>
                <TreePanel />
              </Provider>
            </SplitPane>
          )}

          {/* drawer.drawerChild == DrawerPanes.PROFILE && <ConnectionProfilePanel /> */}

          {drawer.drawerChild == DrawerPanes.DYNAMIC && <TreeActionPanel />}

          {drawer.drawerChild == DrawerPanes.AGGREGATE && (
            <AggregateLeftPanel className="sidebarAggregate" />
          )}

          {drawer.drawerChild == DrawerPanes.BACKUP_RESTORE && <BackupRestore />}
        </div>
        {this.props.store.updateAvailable && (
          <div className="leftPaneUpdateNotification">
            <Button
              className="updateButton pt-button pt-intent-primary"
              text="Update Downloaded. Click here to update and restart."
              onClick={this.updateAndRestart}
            />
          </div>
        )}
      </div>
    );
  }
}
