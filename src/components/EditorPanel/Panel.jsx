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
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-05T14:22:40+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-07-10T13:17:40+10:00
 */

/* eslint-disable react/no-string-refs, react/sort-comp, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { inject, observer, PropTypes } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {
  Button,
  Tabs2,
  Tab2,
  Intent,
  ContextMenu,
  Menu,
  MenuItem,
  Dialog,
  AnchorButton
} from '@blueprintjs/core';
import { GlobalHotkeys, DialogHotkeys } from '#/common/hotkeys/hotkeyList.jsx';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
import './Panel.scss';
import WelcomeView from './WelcomePanel/WelcomeView.jsx';

import { ProfileStatus } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: false,
      tabId: 0,
      vertical: false
    };

    this.newEditor = this.newEditor.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.closeActiveTab = this.closeActiveTab.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.onTabScrollLeftBtnClicked = this.onTabScrollLeftBtnClicked.bind(this);
    this.onTabScrollRightBtnClicked = this.onTabScrollRightBtnClicked.bind(
      this
    );
    this.onTabListBtnClicked = this.onTabListBtnClicked.bind(this);
  }

  componentWillMount() {
    this.reactionToProfile = reaction(
      () => this.props.store.profileList.selectedProfile,
      () => {
        try {
          if (
            this.props.store.profileList.selectedProfile.id ==
            this.props.store.editorPanel.activeDropdownId
          ) {
            console.log(
              'do nothing as the profile might have been swaped by the dropdown.'
            );
            return;
          }
          let curEditor;
          if (this.props.store.editorPanel.activeEditorId != 'Default') {
            curEditor = this.props.store.editors.get(
              this.props.store.editorPanel.activeEditorId
            );
          }

          if (
            curEditor &&
            curEditor.currentProfile ==
              this.props.store.profileList.selectedProfile.id
          ) {
            console.log('do nothing');
          } else {
            const editors = this.props.store.editors.entries();
            for (const editor of editors) {
              console.log(
                'editor[1].currentProfile :',
                editor[1].currentProfile
              );
              if (
                editor[1].currentProfile ==
                this.props.store.profileList.selectedProfile.id
              ) {
                this.changeTab(editor[1].id);
                return;
              }
            }
            if (this.props.store.editorToolbar.newEditorForProfileId == '') {
              this.props.store.editorToolbar.newEditorForProfileId = this.props.store.profileList.selectedProfile.id;
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    );
  }

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }
  componentWillUnmount() {
    this.reactionToProfile();
    Mousetrap.unbindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }
  reactionToProfile;
  /**
   * DEPRECATED? Remove this after refactoring.
   * Action for creating a new editor in the MobX store.
   * @param {String} newId - The id of the newly created Editor tab.
   */
  @action
  newEditor(newId) {
    this.props.store.editorPanel.activeDropdownId = newId;
    this.props.store.editorPanel.activeEditorId = newId;
    this.setState({ tabId: newId });
  }

  /**
   * Action for closing a tab.
   * @param {Object} currEditor - the editor mobx object
   */
  @action
  closeTab(currEditor) {
    if (!currEditor.doc.isClean()) {
      this.props.store.editorPanel.showingSavingDialog = true;
      return;
    }
    console.log('deleted editor ', currEditor);
    if (currEditor && currEditor.status == ProfileStatus.OPEN) {
      // close the connection
      featherClient()
        .service('/mongo-shells')
        .remove(currEditor.profileId, {
          query: {
            shellId: currEditor.shellId
          }
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }
    // NEWLOGIC Check if closed editor is current editor:
    if (currEditor.id == this.props.store.editorPanel.activeEditorId) {
      this.props.store.editorPanel.isRemovingCurrentTab = true;
      // Check if this is the last tab:
      if (this.props.store.editors.size == 1) {
        // Show and select welcome tab
        this.props.store.welcomePage.isOpen = true;
        this.props.store.editorPanel.activeEditorId = 'Default';
      } else {
        // Show and select first entry in map.
        console.log('1:', this.props.store.editorPanel.activeEditorId);
        this.props.store.editorPanel.removingTabId = currEditor.id;
        this.props.store.editors.delete(currEditor.id);
        const editors = this.props.store.editors.entries();
        this.props.store.editorPanel.activeEditorId = editors[0][1].id;
        console.log('2:', this.props.store.editorPanel.activeEditorId);

        const treeEditor = this.props.store.treeActionPanel.editors.get(
          currEditor.id
        );
        if (treeEditor) {
          this.props.store.treeActionPanel.editors.delete(treeEditor.id);
        }
        return;
      }
    } else {
      this.props.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.props.store.editorPanel.removingTabId = currEditor.id;
    this.props.store.editors.delete(currEditor.id);

    const treeEditor = this.props.store.treeActionPanel.editors.get(
      currEditor.id
    );
    if (treeEditor) {
      this.props.store.treeActionPanel.editors.delete(treeEditor.id);
    }

    this.forceUpdate();
  }

  /**
   * Action for closing active tab.
   */
  @action
  closeActiveTab() {
    const deletedEditor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId
    );
    console.log('deleted editor ', deletedEditor);
    if (deletedEditor && deletedEditor.status == ProfileStatus.OPEN) {
      // close the connection
      featherClient()
        .service('/mongo-shells')
        .remove(deletedEditor.profileId, {
          query: {
            shellId: deletedEditor.shellId
          }
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }
    // TODO Check if closed editor is current editor:
    // if (true) {
    this.props.store.editorPanel.isRemovingCurrentTab = true;
    // Check if this is the last tab:
    if (this.props.store.editors.size == 1) {
      // Show and select welcome tab
      this.props.store.welcomePage.isOpen = true;
      this.props.store.editorPanel.activeEditorId = 'Default';
    } else {
      // Show and select first entry in map.
      console.log('1:', this.props.store.editorPanel.activeEditorId);
      this.props.store.editorPanel.removingTabId = deletedEditor.id;
      this.props.store.editors.delete(deletedEditor.id);
      const editors = this.props.store.editors.entries();
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
      console.log('2:', this.props.store.editorPanel.activeEditorId);

      const treeEditor = this.props.store.treeActionPanel.editors.get(
        deletedEditor.id
      );
      if (treeEditor) {
        this.props.store.treeActionPanel.editors.delete(treeEditor.id);
      }
      return;
    }
    // }
    this.props.store.editorPanel.removingTabId = deletedEditor.id;
    this.props.store.editors.delete(deletedEditor.id);

    const treeEditor = this.props.store.treeActionPanel.editors.get(
      deletedEditor.id
    );
    if (treeEditor) {
      this.props.store.treeActionPanel.editors.delete(treeEditor.id);
    }

    this.forceUpdate();
  }

  /**
   * Action for closing the welcome Tab
   */
  @action.bound
  closeWelcome() {
    this.props.store.welcomePage.isOpen = false;
    this.props.store.editorPanel.removingTabId = true;
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      const editors = this.props.store.editors.entries();
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
    }
    this.forceUpdate();
  }

  /**
   * Action for swapping the currently selected tab.
   * @param {String} newTab - Id of tab to swap to active.
   */
  @action
  changeTab(newTab) {
    // Check if last update was a remove for special Handling.
    if (this.props.store.editorPanel.removingTabId) {
      this.props.store.editorPanel.removingTabId = false;
      if (this.props.store.editorPanel.isRemovingCurrentTab) {
        this.props.store.editorPanel.isRemovingCurrentTab = false;
        this.props.store.editorPanel.activeEditorId = newTab;
        this.setState({ tabId: newTab });
      } else {
        this.setState({ tabId: this.state.tabId });
      }
    } else {
      this.props.store.editorPanel.activeEditorId = newTab;
      if (
        newTab != 'Default' &&
        this.props.store.editors.get(
          this.props.store.editorPanel.activeEditorId
        ).executing == true
      ) {
        this.props.store.editorToolbar.isActiveExecuting = true;
      } else {
        this.props.store.editorToolbar.isActiveExecuting = false;
      }
      this.setState({ tabId: newTab });
      if (newTab != 'Default') {
        this.props.store.editorPanel.activeDropdownId = this.props.store.editors.get(
          newTab
        ).currentProfile;
        // Check if connection exists or is closed to update dropdown.
        if (
          !this.props.store.profiles.get(
            this.props.store.editorPanel.activeDropdownId
          )
        ) {
          this.props.store.editorPanel.activeDropdownId = 'Default';
        } else if (
          this.props.store.profiles.get(
            this.props.store.editorPanel.activeDropdownId
          ).status == 'CLOSED'
        ) {
          this.props.store.editorPanel.activeDropdownId = 'Default';
        }
        this.props.store.editorToolbar.id = this.props.store.editors.get(
          newTab
        ).id;
        this.props.store.editorToolbar.shellId = this.props.store.editors.get(
          newTab
        ).shellId;
      }
      console.log(
        `activeDropdownId: ${this.props.store.editorPanel
          .activeDropdownId} , id: ${this.props.store.editorToolbar
          .id}, shellId: ${this.props.store.editorToolbar.shellId}`
      );
      if (this.props.store.editorPanel.activeDropdownId == 'Default') {
        this.props.store.editorToolbar.noActiveProfile = true;
      } else {
        this.props.store.editorToolbar.noActiveProfile = false;
      }
    }
  }

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action
  handleDrop(item) {
    this.props.store.dragItem.item = item;
    if (!this.props.store.dragItem.dragDrop) {
      this.props.store.dragItem.dragDrop = true;
    } else {
      this.props.store.dragItem.dragDrop = false;
      const setDragDropTrueLater = () => {
        // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDrop = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  /**
   * Close all tabs except for the provided tab id
   * @param {String} keepTab - The id string of the editor to keep (optional)
   */
  @action.bound
  closeTabs(keepTab) {
    const editors = this.props.store.editors.entries();
    console.log(editors);
    editors.map((editor) => {
      if (editor[1].id != keepTab) {
        console.log(`Closing Tab ${editor[1].id}`);
        this.closeTab(editor[1]);
      }
    });
  }

  /**
   *  Close all tabs to the left of the current tab
   *  @param {String} currentTab - The id of the leftmost tab that will stay open
   */
  closeLeft(currentTab) {
    const editors = this.props.store.editors.entries();
    editors.every((editor) => {
      if (editor[1].id != currentTab) {
        console.log(`Closing Tab ${editor[1].id}`);
        this.closeTab(editor[1]);
        return true;
      }
      return false;
    });
  }

  /**
   *  Close all tabs to the right of the current tab
   *  @param {String} currentTab - The id of the rightmost tab that will stay open
   */
  closeRight(currentTab) {
    const editors = this.props.store.editors.entries();
    let startClosing = false;
    editors.map((editor) => {
      if (editor[1].id != currentTab) {
        if (startClosing) {
          console.log(`Closing Tab ${editor[1].id}`);
          this.closeTab(editor[1]);
        }
      } else {
        startClosing = true;
      }
    });
  }

  /** Display a right click menu when any of the editor tabs are right clicked
   *  @param {SyntheticMouseEvent} event - mouse click event from onContextMenu
   */
  showContextMenu(event) {
    const target = event.target;
    const tabId = target.getAttribute('data-tab-id');
    const currentEditor = this.props.store.editors.get(tabId);

    if (tabId) {
      console.log(tabId);
      ContextMenu.show(
        <Menu className="editorTabContentMenu">
          <div className="menuItemWrapper closeTabItem">
            <MenuItem
              onClick={() => {
                tabId === 'Default'
                  ? this.closeWelcome()
                  : this.closeTab(currentEditor);
              }}
              text={globalString('editor/tabMenu/closeTab')}
              iconName="pt-icon-small-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeOtherItem">
            <MenuItem
              onClick={() => this.closeTabs(tabId)}
              text={globalString('editor/tabMenu/closeOtherTabs')}
              iconName="pt-icon-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeAllItem">
            <MenuItem
              onClick={this.closeTabs}
              text={globalString('editor/tabMenu/closeAllTabs')}
              iconName="pt-icon-key-delete"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeLeftItem">
            <MenuItem
              onClick={() => {
                this.closeLeft(tabId);
              }}
              text={globalString('editor/tabMenu/closeLeft')}
              iconName="pt-icon-chevron-left"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeRightItem">
            <MenuItem
              onClick={() => {
                this.closeRight(tabId);
              }}
              text={globalString('editor/tabMenu/closeRight')}
              iconName="pt-icon-chevron-right"
              intent={Intent.NONE}
            />
          </div>
        </Menu>,
        {
          left: event.clientX,
          top: event.clientY
        },
        () => {
          console.log('tab context menu closed');
        }
      );
    }
  }

  @action.bound
  renderWelcome() {
    if (this.props.store.editors.size == 0) {
      return (
        <Tab2
          className="welcomeTab"
          id="Default"
          title={globalString('editor/welcome/heading')}
          panel={<WelcomeView />}
        />
      );
    }
    return (
      <Tab2
        className={
          this.props.store.welcomePage.isOpen
            ? 'welcomeTab'
            : 'welcomeTab notVisible'
        }
        id="Default"
        title={globalString('editor/welcome/heading')}
        panel={<WelcomeView />}
      >
        <Button className="pt-minimal" onClick={this.closeWelcome}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab2>
    );
  }

  @action.bound
  onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    this.toolbar.wrappedInstance
      .saveFile()
      .then(() => {
        this.closeTab(currentEditor);
      })
      .catch((e) => {
        if (e) {
          console.error(e);
        }
      });
  }

  @action.bound
  onSavingDialogCancelButtonClicked(unbindGlobalKeys) {
    unbindGlobalKeys();
    this.props.store.editorPanel.showingSavingDialog = false;
  }

  @action.bound
  onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    currentEditor.doc.markClean();
    this.closeTab(currentEditor);
  }

  renderSavingDialog() {
    const { editorPanel: { activeEditorId }, editors } = this.props.store;
    const currentEditor = editors.get(activeEditorId);

    let unbindGlobalKeys;

    const onSavingDialogSaveButtonClicked = () =>
      this.onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor);
    const onSavingDialogCancelButtonClicked = () =>
      this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    const onSavingDialogDontSaveButtonClicked = () =>
      this.onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor);

    Mousetrap.bindGlobal(
      DialogHotkeys.submitDialog.keys,
      onSavingDialogSaveButtonClicked
    );
    Mousetrap.bindGlobal(
      DialogHotkeys.closeDialog.keys,
      onSavingDialogCancelButtonClicked
    );

    unbindGlobalKeys = () => {
      Mousetrap.unbindGlobal(
        DialogHotkeys.submitDialog.keys,
        onSavingDialogSaveButtonClicked
      );
      Mousetrap.unbindGlobal(
        DialogHotkeys.closeDialog.keys,
        onSavingDialogCancelButtonClicked
      );
    };

    return (
      <Dialog className="pt-dark savingDialog" intent={Intent.PRIMARY} isOpen>
        <h4>
          {' '}{globalString(
            'editor/savingDialog/title',
            currentEditor.fileName
          )}{' '}
        </h4>
        <p>
          {' '}{globalString('editor/savingDialog/message')}{' '}
        </p>
        <div className="dialogButtons">
          <AnchorButton
            className="saveButton"
            intent={Intent.SUCCESS}
            text={globalString('editor/savingDialog/save')}
            onClick={onSavingDialogSaveButtonClicked}
          />
          <AnchorButton
            className="cancelButton"
            intent={Intent.PRIMARY}
            text={globalString('editor/savingDialog/cancel')}
            onClick={onSavingDialogCancelButtonClicked}
          />
          <AnchorButton
            className="dontSaveButton"
            intent={Intent.DANGER}
            text={globalString('editor/savingDialog/dontSave')}
            onClick={onSavingDialogDontSaveButtonClicked}
          />
        </div>
      </Dialog>
    );
  }

  renderUnsavedFileIndicator(id) {
    return (
      <div id={`unsavedFileIndicator_${id}`} className="unsavedFileIndicator" />
    );
  }

  _isPosEqual(pos1, pos2, accuracy = 1) {
    return Math.abs(pos1 - pos2) < accuracy;
  }

  onTabScrollLeftBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleLeftmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollLeftTargetPosition.bind(
      this,
      currTabEl
    );

    if (this._isPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)) {
      const prevTabEl = currTabEl.previousSibling;
      if (prevTabEl) {
        this.scrollToTab(
          this.getElementScrollLeftTargetPosition.bind(this, prevTabEl)
        );
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabScrollRightBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleRightmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollRightTargetPosition.bind(
      this,
      currTabEl
    );

    if (this._isPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)) {
      const nextTabEl = currTabEl.nextSibling;
      if (nextTabEl) {
        this.scrollToTab(
          this.getElementScrollRightTargetPosition.bind(this, nextTabEl)
        );
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabListBtnClicked() {}

  getElementScrollLeftTargetPosition(el) {
    return Math.min(el.offsetLeft, this.getScrollLeftMax());
  }

  getElementScrollRightTargetPosition(el) {
    const tabListEl = this.tabs.tablistElement;

    return Math.max(
      0,
      Math.min(
        el.offsetLeft + el.offsetWidth - tabListEl.clientWidth,
        this.getScrollLeftMax(tabListEl)
      )
    );
  }

  /**
   * Scroll to target tab with ease-in/out animation
   */
  scrollToTab(getTargetPos, scrollDuration = 200) {
    const el = this.tabs.tablistElement;
    const targetPos = getTargetPos();

    if (this._isPosEqual(el.scrollLeft, targetPos)) return;

    const cosParameter = (el.scrollLeft - targetPos) / 2;
    let scrollCount = 0;
    let oldTimestamp = performance.now();

    const step = (newTimestamp) => {
      const targetPos = getTargetPos();

      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));

      if (scrollCount >= Math.PI) {
        el.scrollLeft = targetPos;
        return;
      }

      el.scrollLeft =
        targetPos +
        Math.round(cosParameter + cosParameter * Math.cos(scrollCount));
      oldTimestamp = newTimestamp;

      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  getCurrentVisibleLeftmostTabElement() {
    const rect = this.tabScrollLeftBtn.getBoundingClientRect();
    return document.elementFromPoint(rect.left + rect.width + 2, rect.top + 2);
  }

  getScrollLeftMax(tabListEl = this.tabs.tablistElement) {
    // tabListEl.clientWidth is the scrollable area width
    return tabListEl.scrollWidth - tabListEl.clientWidth;
  }

  getCurrentVisibleRightmostTabElement() {
    const tabListEl = this.tabs.tablistElement;

    if (
      this._isPosEqual(tabListEl.scrollLeft, this.getScrollLeftMax(tabListEl))
    ) {
      return tabListEl.lastChild;
    }

    const rect = this.tabScrollRightBtn.getBoundingClientRect();
    return document.elementFromPoint(rect.left - 1, rect.top + 2);
  }

  /**
   * Action for rendering the component.
   */
  render() {
    const editors = this.props.store.editors.entries();
    this.props.store.editors.forEach((v) => {
      console.log(v.alias);
    });
    return (
      <div className="pt-dark editorPanel" onContextMenu={this.showContextMenu}>
        <Toolbar
          ref={ref => (this.toolbar = ref)}
          executeAll={this.executeAll}
          newEditor={this.newEditor}
        />
        <Tabs2
          ref={ref => (this.tabs = ref)}
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          animate={this.state.animate}
          onChange={this.changeTab}
          selectedTabId={this.props.store.editorPanel.activeEditorId}
        >
          {this.renderWelcome()}
          {editors.map((tab) => {
            if (tab[1].visible) {
              const tabClassName = tab[1].alias.replace(/[\. ]/g, '');
              return (
                <Tab2
                  className={'editorTab visible ' + tabClassName}
                  key={tab[1].id}
                  id={tab[1].id}
                  title={tab[1].alias + ' (' + tab[1].fileName + ')'}
                  panel={
                    <View
                      id={tab[0]}
                      title={tab[1].alias + ' (' + tab[1].fileName + ')'}
                      onDrop={item => this.handleDrop(item)}
                      editor={tab[1]}
                      ref="defaultEditor"
                    />
                  }
                >
                  {this.renderUnsavedFileIndicator(tab[0])}
                  <Button
                    className="pt-minimal"
                    onClick={() => this.closeTab(tab[1])}
                  >
                    <span className="pt-icon-cross" />
                  </Button>
                </Tab2>
              );
            }
            return (
              <Tab2
                className={'editorTab notVisible ' + tabClassName}
                key={tab[1].id}
                id={tab[1].id}
                title={tab[1].alias}
                panel={
                  <View id={tab[1].id} editor={tab[1]} ref="defaultEditor" />
                }
              >
                {this.renderUnsavedFileIndicator(tab[0])}
                <Button
                  className="pt-intent-primary pt-minimal"
                  onClick={() => this.closeTab(tab[1])}
                >
                  <span className="pt-icon-cross" />
                </Button>
              </Tab2>
            );
          })}
        </Tabs2>
        <div
          ref={ref => (this.tabScrollLeftBtn = ref)}
          className="pt-icon-chevron-left tabControlBtn tabScrollLeftBtn"
          onClick={this.onTabScrollLeftBtnClicked}
        />
        <div
          ref={ref => (this.tabScrollRightBtn = ref)}
          className="pt-icon-chevron-right tabControlBtn tabScrollRightBtn"
          onClick={this.onTabScrollRightBtnClicked}
        />
        <div
          ref={ref => (this.tabListBtn = ref)}
          className="pt-icon-menu tabControlBtn tabListBtn"
          onClick={this.onTabListBtnClicked}
        />
        {this.props.store.editorPanel.showingSavingDialog
          ? this.renderSavingDialog()
          : null}
      </div>
    );
  }
}
