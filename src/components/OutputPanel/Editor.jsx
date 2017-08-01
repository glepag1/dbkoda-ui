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
 */

/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-10T12:33:56+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-26T14:02:40+10:00
*/

import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import CodeMirror from 'react-codemirror';
import 'codemirror/theme/material.css';
import OutputTerminal from './Terminal';

require('codemirror/mode/javascript/javascript');
require('#/common/MongoScript.js');

/**
 * Renders the window through which all output is shown for a specific editor
 * instance. Handles connection setup and view scrolling.
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
}))
@observer
export default class Editor extends React.Component {
  /**
   * @param {Object} props - The properties passed to the component.
   * Contains:
   *    @param {number} id - The unique id of the allocated editor
   *    @param {number} connId - The id of the allocated connection
   *    @param {number} shellId - The shellId of the allocated connection
   *    @param {Object} store - The mobx global store object (injected)
   */

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action
  handleDrop(item) {
    //eslint-disable-line
    this.props.store.dragItem.item = item;
    console.log(this.props.store.dragItem.dragDropTerminal);
    if (!this.props.store.dragItem.dragDropTerminal) {
      this.props.store.dragItem.dragDropTerminal = true;
    } else {
      this.props.store.dragItem.dragDropTerminal = false;
      const setDragDropTrueLater = () => {
        // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDropTerminal = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  render() {
    const outputOptions = {
      smartIndent: true,
      theme: 'material',
      readOnly: true,
      lineWrapping: false,
      tabSize: 2,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      scrollbarStyle: null,
      foldOptions: {
        widget: '...',
      },
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      keyMap: 'sublime',
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Q': function(cm) {
          cm.foldCode(cm.getCursor());
        },
      },
      mode: {
        name: 'javascript',
        json: 'true',
      },
    };
    if (!this.props.store.outputs.get(this.props.id)) {
      return <div className="outputEditor" />;
    }
    return (
      <div className="outputEditor">
        <CodeMirror
          autosave
          ref={(c) => {
            this.editor = c;
          }}
          alwaysScrollToBottom
          value={this.props.store.outputs.get(this.props.id).output}
          options={outputOptions}
        />
        <OutputTerminal
          id={this.props.id}
          profileId={this.props.profileId}
          shellId={this.props.shellId}
          title={this.props.title}
          onDrop={item => this.handleDrop(item)}
        />
      </div>
    );
  }
}
