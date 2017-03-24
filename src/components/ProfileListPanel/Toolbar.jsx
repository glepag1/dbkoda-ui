/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:34:55
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:34:51
*/

/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
import React from 'react';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import {AnchorButton, Intent, Position, Tooltip} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';

@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editDisabled: true,
      removeDisabled: true
    };

    this.newProfile = this.newProfile.bind(this);
  }

  // Placeholder - Linting disabled for this line.
 @action newProfile() { // eslint-disable-line class-methods-use-this
   this.props.store.profileList.selectedProfile = null;
   this.props.store.layout.drawerOpen = true;
  }

  // Placeholder - Linting disabled for this line.
  @action.bound
  editProfile() { // eslint-disable-line class-methods-use-this
    this.props.store.layout.drawerOpen = true;
  }

  // Placeholder - Linting disabled for this line.
  removeProfile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <nav className="pt-navbar profileListToolbar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Create a new Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM_LEFT}>
              <AnchorButton
                className="pt-button pt-icon-add pt-intent-primary newProfileButton"
                loading={this.props.store.profileList.creatingNewProfile}
                onClick={this.newProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Edit a Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-edit pt-intent-primary editProfileButton"
                onClick={this.editProfile}
                disabled={!this.props.store.profileList.selectedProfile} />
            </Tooltip>
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content="Remove a Profile"
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}>
              <AnchorButton
                className="pt-button pt-icon-remove pt-intent-danger removeProfileButton"
                onClick={this.removeProfile}
                disabled />
            </Tooltip>
          </div>
          <span className="pt-navbar-divider" />
          <Tooltip
            intent={Intent.NONE}
            hoverOpenDelay={1000}
            content="Enter a string to search for Profiles"
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}>
            <div className="pt-input-group .modifier">
              <span className="pt-icon pt-icon-search" />
              <input
                className="pt-input"
                type="search"
                placeholder="Filter Profiles..."
                dir="auto"
                onChange={this.onFilterChanged} />
            </div>
          </Tooltip>
        </div>
      </nav>
    );
  }
}