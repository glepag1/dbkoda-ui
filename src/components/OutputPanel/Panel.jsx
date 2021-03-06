/*
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-08T16:06:11+11:00
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
import { action, reaction, runInAction, toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Tab2, Tabs2, Button } from '@blueprintjs/core';
import { DetailsPanel } from '#/DetailsPanel';
import { StoragePanel } from '#/StoragePanel';
import { ChartPanel } from '#/ChartPanel';
import { LocalTerminal, SshTerminal } from '#/Terminal';
import { EditorTypes } from '#/common/Constants.js';
import { terminalTypes, terminalDisplayNames } from '~/api/Terminal';
import OutputToolbar from './Toolbar';
import OutputEditor from './Editor';
import './style.scss';
import { Explain } from '../ExplainPanel/index';
import { Broker, EventType } from '../../helpers/broker';
import { EnhancedJson } from '../EnhancedJsonPanel';
import { TableView } from '../TableViewPanel';

/**
 * The main panel for the Output view, this handles tabbing,
 * and parents the editor and toolbar components
 */
@inject('store', 'api')
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.lastEditorId = null;
    this.editorRefs = [];
    this.setEditorRef = this.setEditorRef.bind(this);
    this.getDocumentAtLine = this.getDocumentAtLine.bind(this);
    this.closingTab = false;
    /**
     * Reaction function for when the active editorPanel is changed,
     * update the active outputPanel
     * @param {function()} - The state that will trigger the reaction
     * @param {function()} - The reaction to trigger on state change
     * @param {Object} - The options object for reactions
     */
    reaction(
      () => this.props.store.editorPanel.activeEditorId,
      activeEditorId => {
        this.props.store.outputPanel.currentTab = activeEditorId;
      },
      { name: 'reactionOutputPanelTabChange' }
    );

    this.debug = true;
  }

  componentWillMount() {
    Broker.on(
      EventType.EXPLAIN_OUTPUT_PARSED,
      this.explainOutputAvailable.bind(this)
    );
    Broker.on(
      EventType.SHELL_OUTPUT_AVAILABLE,
      this.shellOutputAvailable.bind(this)
    );
  }

  componentWillUnmount() {
    Broker.removeListener(
      EventType.EXPLAIN_OUTPUT_PARSED,
      this.explainOutputAvailable.bind(this)
    );
    Broker.removeListener(
      EventType.SHELL_OUTPUT_AVAILABLE,
      this.shellOutputAvailable.bind(this)
    );
  }

  @action.bound
  explainOutputAvailable({ id, shell }) {
    const editors = this.props.store.editors.entries();
    const that = this;
    editors.map(editor => {
      if (
        editor[1].visible &&
        editor[1].shellId == that.props.store.editorToolbar.shellId &&
        editor[1].shellId == shell &&
        editor[1].profileId == id &&
        editor[1].explains &&
        !editor[1].explains.active
      ) {
        runInAction(() => {
          editor[1].explains.active = true;
        });
      }
    });
  }

  @action.bound
  shellOutputAvailable({ id, shellId }) {
    const editors = this.props.store.editors.entries();
    editors.map(editor => {
      if (
        editor[1].visible &&
        editor[1].shellId == this.props.store.editorToolbar.shellId &&
        editor[1].shellId == shellId &&
        editor[1].profileId == id
      ) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = editor[1].id;
          if (editor[1].explains) {
            editor[1].explains.active = false;
          }
        });
      }
    });
  }

  @action.bound
  closeTab(editorId, tabType) {
    switch (tabType) {
      case 'tableJSON':
        this.props.store.outputs.get(editorId).tableJson = null;
        this.forceUpdate();
        break;
      case 'chartPanel':
        this.props.store.outputs.get(editorId).chartPanel = null;
        this.forceUpdate();
        break;
      case 'detailsView':
        this.props.store.editors.get(editorId).detailsView = null;
        this.forceUpdate();
        break;
      case 'enhancedJSON':
        this.props.store.outputs.get(editorId).enhancedJson = null;
        this.forceUpdate();
        break;
      case 'explainPanel':
        this.props.store.editors.get(editorId).explains = null;
        this.forceUpdate();
        break;
      default:
        console.error('Closing unknown tab type?');
        break;
    }

    // Set new active output and stop change tab from executing..
    this.props.store.outputPanel.currentTab = this.props.store.outputs.get(
      editorId
    ).id;
    this.closingTab = true;
  }

  @action.bound
  closeStorageView() {
    this.props.store.profileList.selectedProfile.storageView.visible = false;
    this.changeTab(this.props.store.editorPanel.activeEditorId);
    this.closingTab = true;
  }

  setEditorRef(editorId, cmRef) {
    this.editorRefs[editorId] = cmRef;
  }

  getDocumentAtLine(editorId, lineNumber, direction, lines) {
    const cm = this.editorRefs[editorId].getCodeMirror();
    const startLine = cm.getLine(lineNumber);
    // Skip these lines to continue reading result set
    if (
      ['dbKoda>', 'it', 'dbKoda>it', '', 'Type "it" for more'].includes(
        startLine
      )
    ) {
      if (!direction) {
        direction = 1;
      }
      return this.getDocumentAtLine(
        editorId,
        lineNumber + direction,
        direction,
        lines
      );
    }
    if (!startLine || startLine.indexOf('dbKoda>') !== -1) {
      lines.status = 'Invalid';
      return '';
    }
    // There is a selection in CodeMirror
    if (cm.somethingSelected()) {
      return cm.getSelection();
    }
    if (startLine[0] === '{') {
      const prevLine = cm.getLine(lineNumber - 1).trim();
      const nextLine = cm.getLine(lineNumber + 1).trim();
      if (
        startLine[startLine.length - 1] === '}' &&
        (!['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1]) ||
          prevLine.indexOf('dbKoda>') === 0)
      ) {
        if (
          (nextLine && nextLine[0] === '{') ||
          ![']', ',', '}'].includes(nextLine[0])
        ) {
          // This is a single-line document
          lines.start = lineNumber;
          lines.end = lineNumber;
          return startLine;
        }
        // This is the start of a document, only parse downwards
        lines.start = lineNumber;
        return this._getLineText(cm, lineNumber, 1, lines);
      }
    }
    // Parse Multi-line documents
    if (direction === 0) {
      const prevLine = cm.getLine(lineNumber - 1).trim();
      if (
        (prevLine[prevLine.length - 1] === '}' &&
          !['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1])) ||
        prevLine.indexOf('dbKoda>') === 0
      ) {
        lines.start = lineNumber;
        return this._getLineText(cm, lineNumber, 1, lines);
      }
      return (
        this._getLineText(cm, lineNumber - 1, -1, lines) +
        this._getLineText(cm, lineNumber, 1, lines)
      );
    }
    // Direction is 1 or -1 (we came from the Next/Prev buttons)
    direction === -1 ? (lines.end = lineNumber) : (lines.start = lineNumber);
    return this._getLineText(cm, lineNumber, direction, lines);
  }

  _getLineText(cm, lineNumber, direction, lines) {
    let line = cm.getLine(lineNumber);
    if (!line) {
      lines.status = 'Invalid';
      return '';
    }
    if (line.indexOf('dbKoda>') === 0) {
      return '';
    }
    if (direction === -1 && line[0] === '{') {
      const prevLine = cm.getLine(lineNumber - 1).trim();
      if (
        (prevLine && prevLine[prevLine.length - 1] === '}') ||
        !['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1]) ||
        prevLine.indexOf('dbKoda>') >= 0
      ) {
        lines.start = lineNumber;
        return line;
      }
    } else if (direction === 1 && line[line.length - 1] === '}') {
      const nextLine = cm.getLine(lineNumber + 1).trim();
      if (
        (nextLine && nextLine[0] === '{') ||
        ![']', ',', '}'].includes(nextLine[0])
      ) {
        lines.end = lineNumber;
        return line;
      }
    }
    if (direction === -1) {
      line =
        this._getLineText(cm, lineNumber + direction, direction, lines) + line;
    } else {
      line += this._getLineText(cm, lineNumber + direction, direction, lines);
    }
    return line;
  }

  /**
   * Updates the active tab state for the Output view
   * @param {string} newTab - The html id of the new active tab
   */
  @action.bound
  changeTab(newTab) {
    // Check if the tab has just been closed, if so, don't swap to it:
    if (this.closingTab) {
      this.closingTab = false;
    } else {
      this.props.store.outputPanel.currentTab = newTab;
      if (
        newTab.indexOf('Explain') < 0 &&
        newTab.indexOf('Details') < 0 &&
        newTab.indexOf('EnhancedJson') < 0 &&
        newTab.indexOf('TableView') < 0 &&
        newTab.indexOf('Chart') < 0 &&
        newTab.indexOf('Storage') < 0
      ) {
        if (this.editorRefs[newTab]) {
          const cm = this.editorRefs[newTab].getCodeMirror();
          cm.refresh();
          cm.focus();
        }
      }
    }
  }

  /**
   * Renders tabs based on the number of editors currently open
   * @param {Object[]} editors - The editor states that require output rendering
   */
  renderTabs(editors) {
    const tabs = editors.map(editor => {
      const arrTabs = [];
      const editorId = editor[1].id;

      let tabClassName = 'notVisible';
      if (this.props.store.editorPanel.activeEditorId === editorId) {
        tabClassName = 'visible';
      }
      if (editor[1].explains && editor[1].explains.active) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Explain-' + editorId;
          editor[1].explains.active = false;
        });
      }
      if (editor[1].detailsView && editor[1].detailsView.visible) {
        runInAction(() => {
          this.props.store.outputPanel.currentTab = 'Details-' + editorId;
          editor[1].detailsView.visible = false;
        });
      }

      if (this.props.store.editorPanel.activeEditorId === editorId) {
        const title = 'Raw';
        arrTabs.push(
          <Tab2
            className={tabClassName}
            key={editorId}
            id={editorId}
            title={title}
            panel={
              <OutputEditor
                title={title}
                id={editorId}
                profileId={editor[1].profileId}
                connId={editor[1].currentProfile}
                initialMsg={editor[1].initialMsg}
                shellId={editor[1].shellId}
                tabClassName={tabClassName}
                setEditorRef={this.setEditorRef}
                getDocumentAtLine={this.getDocumentAtLine}
              />
            }
          />
        );
        if (
          editor[1].detailsView &&
          editor[1].detailsView.currentProfile !== editor[1].currentProfile
        ) {
          // This is the condition to switch the editor to first one if the profile got change.
          runInAction(() => {
            this.props.store.outputPanel.currentTab = editorId;
          });
        }
        if (this.props.store.outputs.get(editorId).enhancedJson) {
          const tabId = `EnhancedJson-${editorId}`;

          arrTabs.push(
            <Tab2
              className={
                tabClassName !== 'notVisible' ? 'visible' : 'notVisible'
              }
              key={tabId}
              id={tabId}
              title="Enhanced JSON"
              panel={
                <EnhancedJson
                  outputId={editorId}
                  enhancedJson={toJS(
                    this.props.store.outputs.get(editorId).enhancedJson
                  )}
                  getDocumentAtLine={this.getDocumentAtLine}
                />
              }
            >
              <Button
                className="pt-minimal"
                onClick={() => this.closeTab(editorId, 'enhancedJSON')}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );
        }
        if (this.props.store.outputs.get(editorId).tableJson) {
          const tabId = `TableView-${editorId}`;

          arrTabs.push(
            <Tab2
              className={
                tabClassName !== 'notVisible' ? 'visible' : 'notVisible'
              }
              key={tabId}
              id={tabId}
              title="Table"
              panel={
                <TableView
                  outputId={editorId}
                  tableJson={toJS(
                    this.props.store.outputs.get(editorId).tableJson
                  )}
                  getDocumentAtLine={this.getDocumentAtLine}
                />
              }
            >
              <Button
                className="pt-minimal"
                onClick={() => this.closeTab(editorId, 'tableJSON')}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );

          if (
            editor[1].type === EditorTypes.DRILL &&
            this.lastEditorId !== editorId
          ) {
            runInAction(() => {
              this.props.store.outputPanel.currentTab = tabId;
            });
          }
        }
        if (this.props.store.outputs.get(editorId).chartPanel) {
          const tabId = `Chart-${editorId}`;

          arrTabs.push(
            <Tab2
              className={
                tabClassName !== 'notVisible' ? 'visible' : 'notVisible'
              }
              id={tabId}
              key={tabId}
              title="Chart"
              panel={<ChartPanel editorId={editorId} />}
            >
              <Button
                className="pt-minimal"
                onClick={() => this.closeTab(editorId, 'chartPanel')}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );
        }
        {
          const tabId = `Explain-${editorId}`;

          arrTabs.push(
            <Tab2
              className={
                editor[1].explains && tabClassName !== 'notVisible'
                  ? 'visible'
                  : 'notVisible'
              }
              key={tabId}
              id={tabId}
              title="Explain"
              panel={<Explain editor={editor[1]} />}
            >
              <Button
                className="pt-minimal"
                onClick={() => this.closeTab(editorId, 'explainPanel')}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );
        }
        {
          const tabId = `Details-${editorId}`;

          arrTabs.push(
            <Tab2
              className={
                editor[1].detailsView &&
                tabClassName !== 'notVisible' &&
                editor[1].detailsView.currentProfile == editor[1].currentProfile
                  ? 'visible'
                  : 'notVisible'
              }
              key={tabId}
              id={tabId}
              title="Details"
              panel={
                <DetailsPanel
                  isVisible={
                    this.props.store.outputPanel.currentTab.indexOf(
                      'Details'
                    ) >= 0
                  }
                  editor={editor[1]}
                />
              }
            >
              <Button
                className="pt-minimal"
                onClick={() => this.closeTab(editorId, 'detailsView')}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );
        }
        this.lastEditorId = editorId;
      }
      return arrTabs;
    });

    const { selectedProfile } = this.props.store.profileList;

    if (selectedProfile) {
      if (selectedProfile.storageView && selectedProfile.storageView.visible) {
        tabs.push(
          <Tab2
            className="visible"
            key={'Storage-' + selectedProfile.id}
            id={'Storage-' + selectedProfile.id}
            title={'Storage-' + selectedProfile.alias}
            panel={<StoragePanel />}
          >
            <Button
              className="pt-minimal"
              onClick={() => this.closeStorageView()}
            >
              <span className="pt-icon-cross" />
            </Button>
          </Tab2>
        );

        if (selectedProfile.storageView.shouldFocus) {
          runInAction(() => {
            this.props.store.outputPanel.currentTab =
              'Storage-' + selectedProfile.id;
            this.props.store.profileList.selectedProfile.storageView.shouldFocus = false;
          });
        }
      }
    }

    // terminals
    const { store: { terminals }, api } = this.props;
    const localTerminals = [];
    const sshTerminals = [];

    for (const terminal of terminals.values()) {
      const { id, type, name } = terminal;
      const tabId = api.getTerminalTabId(id);

      if (type === terminalTypes.local) {
        localTerminals.push(
          <Tab2
            className="visible"
            key={tabId}
            id={tabId}
            title={`${terminalDisplayNames[type]} - ${name}`}
            panel={<LocalTerminal id={id} tabId={tabId} />}
          >
            <Button
              className="pt-minimal"
              onClick={() => {
                this.closingTab = true;
                api.removeTerminal(id);
              }}
            >
              <span className="pt-icon-cross" />
            </Button>
          </Tab2>
        );
      } else if (type === terminalTypes.ssh) {
        if (selectedProfile && terminal.profileId === selectedProfile.id) {
          sshTerminals.push(
            <Tab2
              className="visible"
              key={tabId}
              id={tabId}
              title={`${terminalDisplayNames[type]} - ${name}`}
              panel={<SshTerminal id={id} tabId={tabId} />}
            >
              <Button
                className="pt-minimal"
                onClick={() => {
                  this.closingTab = true;
                  api.removeTerminal(id);
                }}
              >
                <span className="pt-icon-cross" />
              </Button>
            </Tab2>
          );
        }
      }
    }

    tabs.push(sshTerminals, localTerminals);

    return tabs;
  }

  render() {
    // Toolbar must be rendered after tabs for initialisation purposes
    const defaultVisible =
      this.props.store.editorPanel.activeEditorId == 'Default'
        ? 'visible'
        : 'notVisible';
    return (
      <div className="pt-dark outputPanel">
        <Tabs2
          id="outputPanelTabs"
          className="outputTabView"
          animate={false}
          onChange={this.changeTab}
          selectedTabId={this.props.store.outputPanel.currentTab}
        >
          <Tab2
            key={0}
            className={defaultVisible}
            id="Default"
            panel={
              <OutputEditor
                title="Default"
                id="Default"
                shellId={0}
                setEditorRef={this.setEditorRef}
              />
            }
            title="Default"
          />
          {this.renderTabs(this.props.store.editors.entries())}
        </Tabs2>
        <OutputToolbar
          editorRefs={this.editorRefs}
          getDocumentAtLine={this.getDocumentAtLine}
        />
      </div>
    );
  }
}
