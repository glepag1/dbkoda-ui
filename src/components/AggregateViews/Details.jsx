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
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-07-19 11:17:49
 */

/* eslint import/no-dynamic-require: warn */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable, reaction, runInAction } from 'mobx';
import { AnchorButton, Intent } from '@blueprintjs/core';
import { DrawerPanes } from '#/common/Constants';
import FormBuilder from '#/TreeActionPanel/FormBuilder';
import View from '#/TreeActionPanel/View';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import BYOBlock from './AggregateBlocks/BYOBlock.jsx';
import './style.scss';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: null,
      previousActiveBlock: null,
      reproduceCode: false,
    };
    this.reactionToUpdateDetails = reaction(
      () => this.props.store.editorPanel.updateAggregateDetails,
      () => this.updateDetails(),
    );

    // Get variables for action:
    this.editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );

    /**
     * Resolve the prefetch arguments and return them as params
     * @param  {Array}  args     Arguments array as provided from DDD file
     * @return {Object}          Object containing params for prefetch function
     * 
     */
    this.resolveArguments = (args) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      const params = {};
      let myCount = 1;
      if (args.length > 0) {
        for (let i = 0; i < args.length; i += 1) {
          const arg = args[i];
          if (arg.reference) {
            // Field references another field in the form.
            params[arg.name] =
              editor.blockList[editor.selectedBlock].fields[arg.reference];
            // Create a list of references so the editor knows when to re-fetch results.
            if (editor.blockList[editor.selectedBlock].references) {
              editor.blockList[editor.selectedBlock].references[
                arg.reference
              ] = true;
            } else {
              editor.blockList[editor.selectedBlock].references = {};
              editor.blockList[editor.selectedBlock].references[
                arg.reference
              ] = true;
            }
          } else {
            switch (arg.value) {
              case 'collection':
                params[arg.name] = this.currentCollection;
                break;
              case 'database':
                params[arg.name] = this.currentDB;
                break;
              case 'prevAttributes':
                // Check if attributeList has been gathered, if so, return, if not, wait
                while (
                  !editor.blockList[editor.selectedBlock].attributeList &&
                  myCount < 10000
                ) {
                  myCount += 1;
                }
                console.log(
                  'Serving attributes: ',
                  editor.blockList[editor.selectedBlock].attributeList,
                );
                params[arg.name] =
                  editor.blockList[editor.selectedBlock].attributeList;
                break;
              default:
                console.error(
                  'Invalid arguments to Aggregate Block (This should not really happen :( - ',
                  args,
                );
            }
          }
        }
      }
      return params;
    };
    this.formBuilder = new FormBuilder();
  }

  componentWillUnmount() {
    this.reactionToUpdateDetails();
  }
  updateDetails() {
    if (this.props.store.editorPanel.updateAggregateDetails) {
      this.props.store.editorPanel.updateAggregateDetails = false;
      this.state.reproduceCode = true;
      this.forceUpdate();
      // Current hack to handle the async nature of the mobx form builder.
      _.delay(() => {
        this.forceUpdate();
      }, 100);
    }
  }

  // Triggered when a mobx field is changed, this will update the store to reflect the new values.
  @action.bound
  updateBlockFields(fields, editorObject) {
    const selectedBlock = editorObject.selectedBlock;
    editorObject.blockList[selectedBlock].modified = true;
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const oldKey = editorObject.blockList[selectedBlock].fields[key];
        editorObject.blockList[selectedBlock].fields[key] = fields[key];

        if (!(oldKey === fields[key])) {
          if (editorObject.blockList[selectedBlock].references) {
            if (editorObject.blockList[selectedBlock].references[key]) {
              this.state.form = null;
              this.props.store.editorPanel.updateAggregateDetails = true;
            }
          }
        }
      }
    }
    // Update Editor Contents.
    this.props.store.treeActionPanel.formValues = this.generateCode(
      editorObject,
    );
    this.props.store.treeActionPanel.isNewFormValues = true;
  }

  /**
   * Generates valid Mongo Code using Handlebars and the Details MobX-Form.
   * 
   * @param {Object} editorObject - Editor Object to generate handlebars code for.
   */
  generateCode(editorObject) {
    const os = require('os').release();
    let newLine = '\n';
    if (os.match(/Win/gi)) {
      newLine = '\r\n';
    }

    let codeString =
      'use ' + editorObject.collection.refParent.text + ';' + newLine;

    // First add Start block.
    if (
      editorObject.blockList &&
      editorObject.blockList[0] &&
      editorObject.blockList[0].type.toUpperCase() === 'START'
    ) {
      const formTemplate = require('./AggregateBlocks/BlockTemplates/Start.hbs');
      codeString +=
        formTemplate(editorObject.blockList[0].fields) + ';' + newLine;
    }
    codeString +=
      'db.' + editorObject.collection.text + '.aggregate([' + newLine;

    const selectedBlockIndex = editorObject.selectedBlock;
    // Then add all other blocks.
    editorObject.blockList.map((block, index) => {
      if (!(block.type.toUpperCase() === 'START')) {
        if (block.byoCode) {
          if (block.code) {
            block.code.replace(/\r\n/g, newLine);
            block.code.replace(/\n/g, newLine);
            if (index > selectedBlockIndex) {
              codeString +=
                '/*' +
                block.code.replace(/\r\n/g, /newLine/) +
                ', */' +
                newLine;
            } else {
              codeString +=
                block.code.replace(/\r\n/g, /newLine/) + ',' + newLine;
            }
          }
        } else {
          const formTemplate = require('./AggregateBlocks/BlockTemplates/' +
            block.type +
            '.hbs');
          if (index > selectedBlockIndex) {
            codeString += '/*' + formTemplate(block.fields) + ', */' + newLine;
          } else {
            codeString += formTemplate(block.fields) + ',' + newLine;
          }
        }
      }
    });

    codeString += '],';
    codeString += '{';

    if (
      editorObject.blockList &&
      editorObject.blockList[0] &&
      editorObject.blockList[0].type.toUpperCase() === 'START'
    ) {
      codeString +=
        'allowDiskUse: ' + editorObject.blockList[0].fields.DiskUsage;
    }
    codeString += '}';
    codeString += ');';
    return codeString;
  }

  formPromise;
  dynamicForm;
  @observable msg = '';
  @observable bForm = false;
  @action
  showForm(value) {
    this.bForm = value;
  }
  @action
  updateMsg(value) {
    this.msg = value;
  }

  @action.bound
  onHideLeftPanelClicked() {
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
  }

  @action.bound
  byoCode() {
    // Get current block.
    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    editor.blockList[editor.selectedBlock].byoCode = true;
    editor.blockList[editor.selectedBlock].code = false;
    this.forceUpdate();
  }

  @action.bound
  nonBYOCode() {
    // Get current block.
    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    editor.blockList[editor.selectedBlock].byoCode = false;
    this.forceUpdate();
  }

  render() {
    const activeEditor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    this.currentDB = this.editor.collection.refParent.text;
    this.currentCollection = this.editor.collection.text;
    const blockIndex = activeEditor.selectedBlock;
    const activeBlock = activeEditor.blockList[blockIndex];

    // Check if this is a BYOcode block, if so, render BYO fragment.
    if (activeBlock && activeBlock.byoCode) {
      // Update Handlebars first:
      // Update Editor Contents.
      runInAction(() => {
        this.props.store.treeActionPanel.formValues = this.generateCode(
          activeEditor,
        );
        this.props.store.treeActionPanel.isNewFormValues = true;
      });
      return (
        <div className="aggregateDetailsWrapper">
          <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
            <h2 className="currentBlockChoice">
              {' '}{globalString('aggregate_builder/details_title')}
            </h2>
          </nav>
          <div className="aggregateDetailsContent">
            <BYOBlock onChangeCallback={this.generateCode} />
            <div className="bottomToolbar">
              <AnchorButton
                className="hideLeftPanelButton"
                intent={Intent.SUCCESS}
                text={globalString('aggregate_builder/hide_left_panel')}
                onClick={this.onHideLeftPanelClicked}
              />
              <AnchorButton
                className="byoCodeButton"
                intent={Intent.SUCCESS}
                text={globalString('aggregate_builder/form_code')}
                onClick={this.nonBYOCode}
              />
            </div>
          </div>
        </div>
      );
    }

    // Check if activeBlock has changed, if so, rebuild the form.
    if (
      activeBlock &&
      (activeBlock !== this.state.previousActiveBlock ||
        this.state.reproduceCode)
    ) {
      this.state.reproduceCode = false;
      this.state.previousActiveBlock = activeBlock;
      this.formPromise = this.formBuilder.createForm(
        this.resolveArguments,
        this.updateBlockFields,
        this.editor,
        {
          action: activeBlock.type,
          aggregate: true,
        },
      );
      this.formPromise
        .then((res) => {
          this.dynamicForm = res;
          this.showForm(true);
          this.setState({ form: this.dynamicForm });
          this.dynamicForm.getData();
        })
        .catch((reason) => {
          this.updateMsg(reason);
        });
    }
    let maxColumns = 2;
    if (this.state.form) {
      maxColumns = BlockTypes[this.state.form.title.toUpperCase()].columns;
      if (!maxColumns) {
        maxColumns = 2;
      }
    }
    return (
      <div className="aggregateDetailsWrapper">
        <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
          <h2 className="currentBlockChoice">
            {globalString('aggregate_builder/details_title')}
          </h2>
        </nav>
        <div className="aggregateDetailsContent">
          {activeBlock &&
            <h2 className="aggregateBlockType">
              {activeBlock.type}
            </h2>}
          {activeBlock &&
            <p className="aggregateBlockDescription">
              {BlockTypes[activeBlock.type.toUpperCase()].description}
            </p>}
          {activeBlock &&
            <div className={'dynamic-form columns-' + maxColumns + '-max'}>
              {this.state.form &&
                <View mobxForm={this.state.form.mobxForm} isAggregate />}
              {!this.bForm &&
                <div>
                  <div className="tree-msg-div">
                    <span>
                      {this.msg}
                    </span>
                  </div>
                </div>}
            </div>}
        </div>
        {!activeBlock &&
          <div className="aggregateDetailsContent">
            <p>
              {' '}{globalString('aggregate_builder/no_block_selected')}
            </p>
          </div>}
        <div className="bottomToolbar">
          <AnchorButton
            className="hideLeftPanelButton"
            intent={Intent.SUCCESS}
            text={globalString('aggregate_builder/hide_left_panel')}
            onClick={this.onHideLeftPanelClicked}
          />
          {activeBlock &&
            activeBlock.type.toUpperCase() !== 'START' &&
            <AnchorButton
              className="byoCodeButton"
              intent={Intent.SUCCESS}
              text={globalString('aggregate_builder/byo_code')}
              onClick={this.byoCode}
            />}
        </div>
      </div>
    );
  }
}
