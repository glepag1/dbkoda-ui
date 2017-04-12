/**
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-24T14:46:56+11:00
 */

import React from 'react';
import {action, reaction, runInAction} from 'mobx';
import {inject, observer} from 'mobx-react';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import {Tab2, Tabs2} from '@blueprintjs/core';
import './style.scss';
import {Explain} from '../ExplainPanel/index';

/**
 * The main panel for the Output view, this handles tabbing,
 * and parents the editor and toolbar components
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    /**
     * Reaction function for when the active editorPanel is changed,
     * update the active outputPanel
     * @param {function()} - The state that will trigger the reaction
     * @param {function()} - The reaction to trigger on state change
     * @param {Object} - The options object for reactions
     */
    const reactionToEditorChange = reaction(
      () => this.props.store.editorPanel.activeEditorId,
      (activeEditorId) => {
        this.props.store.outputPanel.currentTab = this.props.store.editorPanel.activeEditorId;
      },
      {'name': 'reactionOutputPanelTabChange'}
    );
  }

  /**
   * Updates the active tab state for the Output view
   * @param {string} newTab - The html id of the new active tab
   */
  @action.bound
  changeTab(newTab) {
    this.props.store.outputPanel.currentTab = newTab;
  }

  /**
   * Renders tabs based on the number of editors currently open
   * @param {Object[]} editors - The editor states that require output rendering
   */
  renderTabs(editors) {
    const tabs = editors.map((editor) => {
      const editorTitle = editor[1].alias + ' (' + editor[1].shellId + ')';
      let tabClassName = 'notVisible';
      if (editor[1].visible) {
        tabClassName = 'visible';
      }
      if (editor[1].explains && editor[1].active) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Explain-' + editor[1].shellId;
          editor[1].active = false;
        });
      }
      return [
        <Tab2
          className={tabClassName}
          key={editor[1].shellId}
          id={editorTitle}
          title={editorTitle}
          panel={
            <OutputEditor
              title={editorTitle}
              id={editor[1].id}
              shellId={editor[1].shellId} />
          } />,
        <Tab2
          className={editor[1].explains ? 'visible' : 'notVisible'}
          key={'Explain-' + editor[1].shellId}
          id={'Explain-' + editor[1].shellId}
          title={'Explain-' + editor[1].shellId}
          panel={
            <Explain editor={editor[1]} />
          } />
      ];
    });
    return [].concat.apply([], tabs);
  }

  render() {
    // Toolbar must be rendered after tabs for initialisation purposes
    return (
      <div className="pt-dark outputPanel">
        <Tabs2 id="outputPanelTabs"
          className="outputTabView"
          onChange={this.changeTab}
          selectedTabId={this.props.store.outputPanel.currentTab}>
          <Tab2 key={0}
            id="Default"
            panel={
              <OutputEditor title="Default" id="Default" shellId={0} />
                }
            title="Default" />

          {this.renderTabs(this.props.store.editors.entries())}
        </Tabs2>
        <OutputToolbar />
      </div>
    );
  }
}
