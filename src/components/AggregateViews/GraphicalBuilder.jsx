/*
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-03T11:54:11+11:00
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

/* eslint import/no-dynamic-require: 0 */

import React from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import path from 'path';
import {
  Alert,
  AnchorButton,
  Intent,
  Tooltip,
  Position,
} from '@blueprintjs/core';
import { DrawerPanes } from '#/common/Constants';
import { NewToaster } from '#/common/Toaster';
import ErrorView from '#/common/ErrorView';
import { Broker, EventType } from '~/helpers/broker';
import { featherClient } from '~/helpers/feathers';
import Block from './AggregateBlocks/Block.jsx';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import FirstBlockTarget from './AggregateBlocks/FirstBlockTaget.jsx';
import LastBlockTarget from './AggregateBlocks/LastBlockTarget.jsx';
import './style.scss';
import { AggregateCommands } from './AggregateCommands.js';
import GenerateChartButton from './GenerateChartButton';
import ShowIcon from '../../styles/icons/show-icon.svg';
import ImportIcon from '../../styles/icons/import-icon.svg';
import ExportIcon from '../../styles/icons/export-icon.svg';

const { dialog, BrowserWindow } = IS_ELECTRON
  ? window.require('electron').remote
  : {};

const FILE_FILTERS = [
  {
    name: 'Aggregate',
    extensions: ['agg'],
  },
];

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class GraphicalBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      activeBlockIndex: this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      ).selectedBlock,
      colorMatching: [],
      collection: props.collection,
      isLoading: true,
      failed: false,
      failureReason: 'Unknown',
    };

    Broker.emit(EventType.FEATURE_USE, 'AggregateBuilder');

    this.debug = false;
    // Set up the aggregate builder in the shell.
    this.editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    this.profileId = this.editor.profileId;
    this.shell = this.editor.shellId;
    this.currentDB = this.editor.collection.refParent.text;
    this.currentCollection = this.editor.collection.text;

    // Set loading icon in graphical builder!

    // Add aggregate object to shell.
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(this.profileId, {
        shellId: this.shell, // eslint-disable-line
        commands: AggregateCommands.NEW_AGG_BUILDER(
          this.currentDB,
          this.currentCollection,
        ),
      })
      .then((res) => {
        this.editor.aggregateID = JSON.parse(res).id;
        this.state.isLoading = false;
        if (this.editor.blockList.length === 0) {
          this.addStartBlock();
        }
      })
      .catch((err) => {
        if (err.message.includes('Connection does not exist')) {
          this.state.failureReason = 'ConnectionDoesNotExist';
        } else {
          this.state.failureReason = 'Unknown';
        }
        this.state.isLoading = false;
        this.setState({ failed: true });
        console.error(err);
      });
  }

  /**
   * Function for adding a start block and setting up agg builder.
   */
  @action.bound
  addStartBlock() {
    this.getBlockAttributes(0).then((res) => {
      this.addBlockToEditor('Start', 0, res);
    });
  }

  @action.bound
  addBlock(block, position) {
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );

      this.updateShellPipeline().then(() => {
        this.updateResultSet()
          .then((res) => {
            res = JSON.parse(res);
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].attributeList =
                        res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    console.error(
                      'Result[',
                      index,
                      '] is invalid: ',
                      indexValue,
                    );
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });

              // 4.b Is the current latest step valid?
              if (
                editor.blockList[editor.blockList.length - 1].status === 'valid'
              ) {
                this.getBlockAttributes(position - 1).then((res) => {
                  // 3.a Add to Editor
                  this.addBlockToEditor(
                    block.type,
                    position,
                    res,
                    true,
                    block,
                  ).then(() => {
                    resolve();
                  });
                });
              } else {
                this.addBlockToEditor(
                  block.type,
                  position,
                  null,
                  true,
                  block,
                ).then(() => {
                  resolve();
                });
              }
              this.clearResultsOutput(editor);
            } else {
              // Check for error.
              console.error('updateResultSet: ', res);
              reject();
            }
          })
          .catch((e) => {
            console.error(e);
            reject();
          });
      });
    });
  }

  /**
   * Add a single block to the editor object.
   * @param {blockType} - The type of block to be added.
   * @param {position} - Where the block should be inserted.
   * @param {attributes} - List of avaliable attributes for the .ddd
   */
  @action.bound
  addBlockToEditor(blockType, position, attributeList, isImport, block) {
    return new Promise((resolve) => {
      // Get relevant editor.
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      // Update block list for editor as required.
      const tmpArray = this.props.store.editors
        .get(this.props.store.editorPanel.activeEditorId)
        .blockList.slice();
      if (tmpArray.length === 0) {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false,
        });
      } else if (position === 'START') {
        tmpArray.unshift({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false,
        });
      } else if (position === 'END') {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false,
        });
      } else {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false,
        });
        if (isImport) {
          this.moveImportBlock(tmpArray, tmpArray.length - 1, position);
        } else {
          this.moveBlock(tmpArray, tmpArray.length - 1, position);
        }
      }

      this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      ).blockList = tmpArray;

      // Update block attributes
      editor.blockList[position].status = 'pending';
      editor.blockList[position].attributeList = attributeList;
      editor.selectedBlock = position;
      this.props.store.editorPanel.updateAggregateDetails = true;
      this.selectBlock(position).then(() => {
        if (block) {
          for (const key in block.fields) {
            if (block.fields.hasOwnProperty(key)) {
              // eslint-disable-line
              // Check if field is an array:
              if (typeof block.fields[key] === 'object') {
                // For each property in the object.
                block.fields[key].forEach((value) => {
                  if (editor.blockList[position].fields[key]) {
                    editor.blockList[position].fields[key].push(value);
                  }
                });
              } else {
                editor.blockList[position].fields[key] = block.fields[key];
              }
            }
          }
        }
        resolve();
      });
    });
  }
  /**
   * Fetch the block attributes from the shell object.
   * Gets results for all previous stages and attributes avaliable for
   * the new block.
   * @param {position} - The position of the block to get avaliable attributes for.
   * @returns {Promise} - A promise resolving the attributes from the shell.
   */
  @action.bound
  getBlockAttributes(position) {
    return new Promise((resolve, reject) => {
      // Get the relevant editor object.
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      // Fetch response from shell object for all steps up to position - 1
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.GET_ATTRIBUTES(
            editor.aggregateID,
            position,
          ),
        })
        .then((res) => {
          // Check attribute List to see if we have valid attributes returned.
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  /**
   * Used to select a block and set it as the current, then update
   * the relevant other panels.
   *
   * @param {Integer} index - The index of the block to be seleceted
   * @return {Promise} - Returns a new promise objectfor completion of the block selection.
   */
  @action.bound
  selectBlock(index) {
    return new Promise((resolve) => {
      // 1. Update Editor List.
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      this.setOutputLoading(editor.id);
      this.setState({ activeBlockIndex: index });
      this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      ).selectedBlock = index;
      this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      ).blockList[index].isSelected = true;

      // 2. Update Shell Steps.
      this.updateShellPipeline(true).then((res) => {
        if (res && res.unableToUpdateSteps) {
          // Partial update
          console.error('[SELECT] - Unable to fully update steps: ', res);
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }

          runInAction('Update Graphical Builder', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
            this.forceUpdate();
          });
        } else {
          // All steps validated, full update.
          this.updateResultSet().then((res) => {
            res = JSON.parse(res);
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].attributeList =
                        res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    if (!(typeof indexValue === 'string')) {
                      console.error(
                        'Result[',
                        index,
                        '] is invalid: ',
                        indexValue,
                      );
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });
              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }

              runInAction('Update Graphical Builder', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                this.forceUpdate();
                resolve();
              });
            }
          });
        }
      });
    });
  }

  @action.bound
  moveBlockInEditor(blockFrom, blockTo) {
    const tmpArray = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    ).blockList;
    this.moveBlockHelper(tmpArray, blockFrom, blockTo);
    this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    ).blockList = tmpArray;
    if (this.state.activeBlockIndex === blockFrom) {
      this.setState({ activeBlockIndex: blockTo });
    } else if (this.state.activeBlockIndex === blockTo && blockTo === 0) {
      this.setState({ activeBlockIndex: blockTo + 1 });
    } else if (
      this.state.activeBlockIndex === blockTo &&
      blockTo === tmpArray.length - 1
    ) {
      this.setState({ activeBlockIndex: blockTo - 1 });
    } else if (this.state.activeBlockIndex === blockTo) {
      if (blockFrom > blockTo) {
        this.setState({ activeBlockIndex: blockTo + 1 });
      } else {
        this.setState({ activeBlockIndex: blockTo - 1 });
      }
    }

    this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    ).selectedBlock = this.state.activeBlockIndex;
  }

  /**
   * Moves a block from one location to another, updating the
   * builder after the move.
   * @param {Int} blockFrom - The block position to be moved.
   * @param {Int} blockTo - The block position being moved to.
   */
  @action.bound
  moveBlock(blockFrom, blockTo) {
    return new Promise((resolve) => {
      // 1. Update Editor (moveBlock)
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      if (blockTo === 0) {
        blockTo = 1;
      } else if (!blockTo) {
        return null;
      }
      this.moveBlockInEditor(blockFrom, blockTo);
      // 2. Update Shell Steps
      this.updateShellPipeline(true).then((res) => {
        if (res && res.unableToUpdateSteps) {
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }

          runInAction('Update Graphical Builder', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
            this.forceUpdate();
          });
        } else {
          this.updateResultSet().then((res) => {
            res = JSON.parse(res);
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (index === res.stepAttributes.length - 1) {
                  // Not empty now.
                } else if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Block Status - Valid', () => {
                      editor.blockList[index].attributeList =
                        res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    console.error(
                      'Result[',
                      index,
                      '] is invalid: ',
                      indexValue,
                    );
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Block Status - Invalid', () => {
                      editor.blockList[index].attributeList =
                        res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });

              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }

              runInAction('Update Graphical Builder', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                this.forceUpdate();
                resolve();
              });
            }
          });
        }
      });
    });
  }

  /**
   *
   */
  moveImportBlock(array, oldIndex, newIndex) {
    // Standard array move:
    if (newIndex >= array.length) {
      let tmpArray = newIndex - array.length;
      while ((tmpArray -= 1) + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  }

  /**
   * Removed a block from a position, updating
   * the builder after the removal.
   * @param {Int} blockPosition - The position to be removed.
   */
  @action.bound
  removeBlock(blockPosition) {
    const editor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    // 1. Remove from Editor Structure.
    editor.blockList.splice(blockPosition, 1);
    // 2. Update Shell Steps.
    this.updateShellPipeline(false).then((res) => {
      if (res && res.unableToUpdateSteps) {
        // Partial update
        console.error('Unable to complete full update!');

        // 4. Was the block removed the selected block?.
        if (blockPosition === editor.selectedBlock) {
          // 4.a Yes - Set selected block to current - 1.
          editor.selectedBlock -= 1;
          if (editor.selectedBlock < 0) {
            editor.selectedBlock = 0;
          }
        }
        // 4. Is the current block valid?.
        if (editor.blockList[editor.selectedBlock].status === 'valid') {
          // 4.a Yes - Update Results.
          this.updateResultsOutput(editor, editor.selectedBlock);
        } else {
          // 4.b No - Clear Results.
          this.clearResultsOutput(editor);
        }

        runInAction('Update Graphical Builder', () => {
          this.props.store.editorPanel.updateAggregateDetails = true;
          this.forceUpdate();
        });
      } else {
        this.updateResultSet().then((res) => {
          res = JSON.parse(res);
          if (res.stepAttributes.constructor === Array) {
            // 3. Update Valid for each block.
            res.stepAttributes.map((indexValue, index) => {
              let attributeIndex = index;
              if (index > 0) {
                attributeIndex = index - 1;
              }
              if (index === res.stepAttributes.length - 1) {
                // Not empty now.
              } else if (indexValue.constructor === Array) {
                // Check for error result.
                if (res.stepCodes[index] === 0) {
                  if (!(typeof indexValue === 'string')) {
                    indexValue = '[ "' + indexValue.join('", "') + '"]';
                  }
                  runInAction('Update Graphical Builder', () => {
                    editor.blockList[index].attributeList =
                      res.stepAttributes[attributeIndex];
                    editor.blockList[index].status = 'valid';
                  });
                } else {
                  console.error('Result[', index, '] is invalid: ', indexValue);
                  if (!(typeof indexValue === 'string')) {
                    indexValue = '[ "' + indexValue.join('", "') + '"]';
                  }
                  runInAction('Update Graphical Builder', () => {
                    editor.blockList[index].attributeList =
                      res.stepAttributes[attributeIndex];
                    editor.blockList[index].status = 'pending';
                  });
                }
              }
            });

            // 4. Was the block removed the selected block?.
            if (blockPosition === editor.selectedBlock) {
              // 4.a Yes - Set selected block to current - 1.
              editor.selectedBlock -= 1;
              if (editor.selectedBlock < 0) {
                editor.selectedBlock = 0;
              }
            }

            // 4. Is the current block valid?.
            if (
              editor.blockList[editor.selectedBlock] &&
              editor.blockList[editor.selectedBlock].status === 'valid'
            ) {
              // 4.a Yes - Update Results.
              this.updateResultsOutput(editor, editor.selectedBlock);
            } else {
              // 4.b No - Clear Results.
              this.clearResultsOutput(editor);
            }

            runInAction('Update Graphical Builder', () => {
              this.props.store.editorPanel.updateAggregateDetails = true;
              this.forceUpdate();
            });
          } else {
            // Check for error.
            console.error('updateResultSet: ', JSON.parse(res));
          }
        });
      }
    });
  }

  moveBlockHelper(array, oldIndex, newIndex) {
    // Standard array move:
    if (newIndex >= array.length) {
      let tmpArray = newIndex - array.length;
      while ((tmpArray -= 1) + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  }

  @action.bound
  onShowLeftPanelClicked() {
    this.props.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
  }

  /**
   * Validates that a step is valid before setting all steps in the pipeline.
   *
   * @param {Object} step - The Step object to be validated.
   * @return {Boolean} - Whether or not the step is valid.
   */
  validateBlock(step) {
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.VALIDATE_STEP(step),
        })
        .then((res) => {
          try {
            res = JSON.parse(res);
          } catch (e) {
            console.error(res);
            console.error('Error validating step: ', step);
            resolve(false);
          }
          if (res.type === 'object') {
            resolve(true);
          } else {
            console.error(res);
            resolve(false);
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.code === 400) {
            NewToaster.show({
              message: globalString('aggregate_builder/no_active_connection'),
              className: 'danger',
              iconName: 'pt-icon-thumbs-down',
            });
            this.setOutputBroken();
          }
          reject(e);
        });
    });
  }

  validateAllBlocks(stepArray) {
    return new Promise((resolve) => {
      const returnObject = {
        areAllValid: true,
        firstInvalid: -1,
      };
      if (stepArray.length === 0) {
        resolve(returnObject);
      }
      stepArray.map((step, stepIndex) => {
        const newStep = step.replace(/,\s*$/, '');
        this.validateBlock(newStep).then((res) => {
          if (res === false) {
            resolve({
              areAllValid: false,
              firstInvalid: stepIndex,
            });
          }
          if (stepIndex === stepArray.length - 1) {
            resolve(returnObject);
          }
        });
      });
    });
  }

  /**
   * Updates the shell pipeline with all the existing steps.
   * @returns {Promise} - A promise with the result of the shell update.
   */
  @action.bound
  updateShellPipeline(preserve) {
    return new Promise((resolve, reject) => {
      // Assemble Step Array.
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      const stepArray = [];
      editor.blockList.map((block) => {
        if (block.type !== 'Start') {
          if (block.byoCode) {
            const stepJSON = block.code;
            stepArray.push(stepJSON.replace(/\n/g, ' '));
          } else {
            const formTemplate = require('./AggregateBlocks/BlockTemplates/' +
              block.type +
              '.hbs');
            const stepJSON = formTemplate(block.fields);
            try {
              stepArray.push(stepJSON.replace(/\n/g, ' '));
            } catch (e) {
              console.error('Block generated invalid JSON: ', block);
            }
          }
        }
      });

      // Before setting all steps, validate steps:
      this.validateAllBlocks(stepArray).then((res) => {
        if (res.areAllValid === true) {
          // Update steps in Shell:
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 30000;
          service
            .update(editor.profileId, {
              shellId: editor.shellId, // eslint-disable-line
              commands: AggregateCommands.SET_ALL_STEPS(
                editor.aggregateID,
                stepArray,
                preserve,
              ),
              responseType: 'text',
            })
            .then(() => {
              this.updateConfig().then((res) => {
                resolve(res);
              });
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          // There is an invalid step, mark it and update each step.
          editor.blockList.map((block, blockIndex) => {
            if (blockIndex > res.firstInvalid) {
              block.status = 'pending';
            } else {
              block.status = 'valid';
            }
          });
          // Update only first N blocks.
          const validArray = stepArray.slice(0, res.firstInvalid);
          // Update steps in Shell:
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 30000;
          service
            .update(editor.profileId, {
              shellId: editor.shellId, // eslint-disable-line
              commands: AggregateCommands.SET_ALL_STEPS(
                editor.aggregateID,
                validArray,
                true,
              ),
              responseType: 'text',
            })
            .then(() => {
              this.updateConfig().then((res) => {
                if (res) {
                  res.unableToUpdateSteps = true;
                  resolve(res);
                } else {
                  resolve({ unableToUpdateSteps: true });
                }
              });
            })
            .catch((e) => {
              reject(e);
            });
        }
      });
    });
  }

  /**
   * Updates the result set in the shell object and receives a list of attributes for each step.
   * @returns {Promise} - A promise with the result of the shell query.
   */
  @action.bound
  updateResultSet() {
    return new Promise((resolve) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      // Update steps in Shell:
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.GET_STATUS(editor.aggregateID),
        })
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }

  /**
   * Clear the output tab since no results are avaliable.
   *
   * @param {Object} Editor - The editor to update the output for.
   */
  @action.bound
  clearResultsOutput(editor) {
    const output = this.props.store.outputs.get(editor.id);
    output.output = globalString('aggregate_builder/no_valid_output');
  }

  /**
   * Updates the output tab to reflect the results for the current step.
   *
   * @param {Object} Editor - The editor to update the output for.
   */
  @action.bound
  updateResultsOutput(editor, stepId) {
    const output = this.props.store.outputs.get(editor.id);
    output.output = globalString('aggregate_builder/valid_output');

    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(editor.profileId, {
        shellId: editor.shellId, // eslint-disable-line
        commands: AggregateCommands.GET_RESULTS(
          editor.aggregateID,
          stepId,
          false,
        ),
      })
      .then((res) => {
        runInAction('Update Graphical Builder', () => {
          res = JSON.parse(res);
          if (res.length === 0) {
            output.output = globalString('aggregate_builder/no_output');
          }
          res.map((indexValue) => {
            output.output += JSON.stringify(indexValue) + '\n';
          });
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }

  /**
   * Sets the output to loading while it fetches results.
   *
   * @param {Object} editorId - The editor to update the output for.
   */
  @action.bound
  setOutputLoading(editorId) {
    const output = this.props.store.outputs.get(editorId);
    output.output = globalString('aggregate_builder/loading_output');
  }

  /**
   * Sets the output to loading while it fetches results.
   *
   * @param {Object} editorId - The editor to update the output for.
   */
  @action.bound
  setOutputBroken(editorId) {
    const output = this.props.store.outputs.get(editorId);
    output.output = globalString('aggregate_builder/failed_output');
  }

  @action.bound
  onImportButtonClickedFirst() {
    // Check if connection is open first.
    if (this.props.store.editorPanel.activeDropdownId === 'Default') {
      NewToaster.show({
        message: globalString(
          'aggregate_builder/no_active_connection_for_import',
        ),
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    } else {
      this.setState({ isImportAlertOpen: true });
    }
  }

  @action.bound
  handleCloseAlert() {
    this.setState({ isImportAlertOpen: false });
  }

  /**
   * Import an aggregate builder.
   */
  @action.bound
  onImportButtonClicked() {
    this.setState({ isImportAlertOpen: false });
    if (IS_ELECTRON) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          properties: ['openFile', 'multiSelections'],
          filters: FILE_FILTERS,
        },
        (fileNames) => {
          if (!fileNames) {
            return;
          }

          _.forEach(fileNames, (v) => {
            this.props.store
              .openFile(v, ({ _id, content }) => {
                this.setState({ isLoading: true });
                const contentObject = JSON.parse(content);
                this.importFile(contentObject);
              })
              .catch(() => {});
          });
        },
      );
    } else {
      const warningMsg = globalString(
        'editor/toolbar/notSupportedInUI',
        'openFile',
      );
      NewToaster.show({
        message: warningMsg,
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
    }
  }

  /**
   * Export an aggregate builder.
   */
  @action.bound
  onExportButtonClicked() {
    if (IS_ELECTRON) {
      // Get current editor.
      const currentEditor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );

      // Make sure an editor exists (Sanity Check)
      if (!currentEditor) {
        return Promise.reject();
      }

      // Save file function.
      const _saveFile = (path, fileContent) => {
        const service = featherClient().service('files');
        service.timeout = 30000;
        return service
          .create({ _id: path, content: fileContent })
          .then(() => currentEditor.doc.markClean())
          .catch((err) => {
            NewToaster.show({
              message: err.message,
              className: 'danger',
              iconName: 'pt-icon-thumbs-down',
            });
            throw err;
          });
      };

      return new Promise((resolve, reject) => {
        // Show electron dialog to get the path.
        dialog.showSaveDialog(
          BrowserWindow.getFocusedWindow(),
          {
            defaultPath: path.resolve(
              this.props.store.editorPanel.lastFileSavingDirectoryPath,
              String(currentEditor.fileName),
            ),
            filters: FILE_FILTERS,
          },
          (fileName) => {
            if (!fileName) {
              reject();
            }
            this.props.store.editorPanel.lastFileSavingDirectoryPath = path.dirname(
              fileName,
            );
            this.getFileContent().then((res) => {
              _saveFile(fileName, JSON.stringify(res))
                .then(() => {
                  NewToaster.show({
                    message: globalString('aggregate_builder/export_passed'),
                    className: 'success',
                    iconName: 'pt-icon-thumbs-up',
                  });
                  runInAction('update fileName and path', () => {
                    currentEditor.fileName = path.basename(fileName);
                    if (window.navigator.platform.toLowerCase() === 'win32') {
                      currentEditor.fileName = fileName.substring(
                        fileName.lastIndexOf('\\') + 1,
                        fileName.length,
                      );
                    }
                    currentEditor.path = fileName;
                  });
                  this.props.store.watchFileBackgroundChange(currentEditor.id);
                  resolve();
                })
                .catch(reject);
            });
          },
        );
      });
    }
  }

  /**
   * Function to convert the relevant objects into an exportable format for saving.
   * @returns {Promise} - Promise containing the resultant contents of the exportable
   * file.
   */
  getFileContent() {
    return new Promise((resolve) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      const exportObject = {
        editorObject: {
          aggConfig: editor.aggConfig,
          aggregateID: editor.aggregateID,
          blockList: editor.blockList,
          collection: editor.collection,
          selectedBlock: editor.selectedBlock,
        },
      };
      resolve(exportObject);
    });
  }

  /**
   *
   * @param {Object} contentObject - Object containing the aggregate builder for
   * import.
   */
  @action.bound
  importFile(contentObject) {
    // const editor = this.props.store.editors.get(
    //   this.props.store.editorPanel.activeEditorId,
    // );
    // Validate File.
    let isValid;
    if (
      contentObject.editorObject &&
      contentObject.editorObject.blockList &&
      contentObject.editorObject.collection
    ) {
      isValid = true;
    } else {
      isValid = false;
    }
    if (isValid) {
      // Remove all Blocks.
      this.removeAllBlocks()
        .then(() => {
          this.addNewBlocks(contentObject);
        })
        .then(() => {
          this.forceUpdate();
        })
        .catch((err) => {
          NewToaster.show({
            message: globalString('aggregate_builder/import_failed'),
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
          this.setState({ isLoading: false });
          this.forceUpdate();
          console.error(err);
        });
    } else {
      NewToaster.show({
        message: globalString('aggregate_builder/import_failed'),
        className: 'danger',
        iconName: 'pt-icon-thumbs-down',
      });
      this.setState({ isLoading: false });
      this.forceUpdate();
      console.error('Invalid import object: ', contentObject);
    }
  }

  /**
   * Removes all blocks from the editor to prepare it for an import.
   *
   * @return {Promise} - Promise object containing a successful purging of the blocks.
   */
  removeAllBlocks() {
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      // Splice list.
      editor.blockList.splice(1, editor.blockList.length - 1);
      // Update Agg Object
      this.updateShellPipeline(false).then((res) => {
        if (res && res.unableToUpdateSteps) {
          // Partial update
          if (this.debug) console.error('Unable to complete full update!');
          editor.selectedBlock = 0;
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }
          runInAction('Update Graphical Builder', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
            this.forceUpdate();
            reject();
          });
        } else {
          this.updateResultSet().then((res) => {
            res = JSON.parse(res);
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (index === res.stepAttributes.length - 1) {
                  // Not empty now.
                } else if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].attributeList =
                        res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    console.error(
                      'Result[',
                      index,
                      '] is invalid: ',
                      indexValue,
                    );
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });
              runInAction('Set Selected Aggregate Block to 0', () => {
                editor.selectedBlock = 0;
              });
              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }
              runInAction('Update Graphical Builder', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                this.forceUpdate();
                resolve();
              });
            } else {
              // Check for error.
              console.error('updateResultSet: ', JSON.parse(res));
              reject();
            }
          });
        }
      });
    });
  }

  /**
   * Adds new blocks from an imported file.
   */
  @action.bound
  addNewBlocks(contentObject) {
    return new Promise(() => {
      const importBlockList = contentObject.editorObject.blockList;
      let count = 0;

      // Function for running through the promises synchronously.
      const importBlock = (blocks) => {
        let p = Promise.resolve();
        blocks.forEach((block) => {
          p = p.then(() => {
            if (count === 0) {
              count += 1;
            } else {
              return this.addBlock(block, count).then(() => {
                count += 1;
              });
            }
          });
        });
        return p;
      };
      return importBlock(importBlockList).then(() => {
        // Select last block.
        this.selectBlock(count - 1).then(() => {
          NewToaster.show({
            message: globalString('aggregate_builder/import_passed'),
            className: 'success',
            iconName: 'pt-icon-thumbs-up',
          });
          this.setState({ isLoading: false });
        });
      });
    });
  }

  /**
   * Sends a request to controller to update config for agg builder.
   *
   * @return {Promise} promise - The promise resolving the config update.
   */
  @action.bound
  updateConfig() {
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      if (editor.blockList[0]) {
        const formTemplate = require('./AggregateBlocks/BlockTemplates/Start.hbs');
        let startCommands = formTemplate(editor.blockList[0].fields) + ';\n';
        if (!editor.aggConfig || !(editor.aggConfig === startCommands)) {
          // Config has changed, send request and update config.
          editor.aggConfig = startCommands;
          startCommands = startCommands.replace(/\n/g, '').replace(/\r/g, '');
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 30000;
          service
            .update(editor.profileId, {
              shellId: editor.shellId, // eslint-disable-line
              commands: startCommands,
              responseType: 'text',
            })
            .then((res) => {
              resolve(res);
            })
            .catch((e) => {
              console.error(e);
              reject();
            });
        }
        // Else, do nothing.
        resolve();
      }
    });
  }

  render() {
    if (this.state.failed) {
      if (this.state.failureReason === 'ConnectionDoesNotExist') {
        return (
          <div className="aggregateGraphicalBuilderWrapper">
            <ErrorView
              title={globalString('aggregate_builder/alerts/failed_title')}
              error={globalString('aggregate_builder/alerts/failed_message')}
            />
          </div>
        );
      }
      return (
        <div className="aggregateGraphicalBuilderWrapper">
          <ErrorView
            title={globalString('aggregate_builder/alerts/failed_title')}
            error={globalString(
              'aggregate_builder/alerts/failed_message_unknown',
            )}
          />
        </div>
      );
    }
    return (
      <div className="aggregateGraphicalBuilderWrapper">
        <div className="topButtons">
          {this.props.store.drawer.drawerChild === DrawerPanes.DEFAULT && (
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              inline
              content={globalString('aggregate_builder/show_left_panel')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="showLeftPanelButton circleButton"
                intent={Intent.SUCCESS}
                onClick={this.onShowLeftPanelClicked}
              >
                <ShowIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          )}
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('aggregate_builder/import_button')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="importButton circleButton"
              intent={Intent.SUCCESS}
              onClick={this.onImportButtonClickedFirst}
            >
              <ImportIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('aggregate_builder/export_button')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="exportButton circleButton"
              intent={Intent.SUCCESS}
              onClick={this.onExportButtonClicked}
            >
              <ExportIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <GenerateChartButton
            connectionId={this.props.editor.currentProfile}
            editorId={this.props.editor.id}
          />
        </div>
        <Alert
          className="importAlert"
          isOpen={this.state.isImportAlertOpen}
          confirmButtonText={globalString('aggregate_builder/alerts/okay')}
          onConfirm={this.onImportButtonClicked}
          cancelButtonText={globalString('aggregate_builder/alerts/cancel')}
          onCancel={this.handleCloseAlert}
        >
          <p>{globalString('aggregate_builder/alerts/importWarningText')}</p>
        </Alert>
        {!this.state.isLoading ? (
          <ul className="graphicalBuilderBlockList">
            <FirstBlockTarget />
            {this.props.store.editors
              .get(this.state.id)
              .blockList.map((indexValue, index) => {
                // Get Block Type for SVG Render.
                let posType = 'MIDDLE';
                if (index === 0) {
                  posType = 'START';
                } else if (
                  index >=
                  this.props.store.editors.get(this.state.id).blockList.length -
                    1
                ) {
                  posType = 'END';
                }

                let blockColor = 0;
                const blockColorLocation = _.findIndex(
                  this.state.colorMatching,
                  {
                    type: indexValue.type,
                  },
                );
                // Check if function type already exists
                if (this.state.colorMatching.length === 0) {
                  this.state.colorMatching.push({
                    type: indexValue.type,
                    color: 0,
                  });
                  blockColor = 0;
                } else if (blockColorLocation !== -1) {
                  // Send through that color for styling.
                  blockColor = this.state.colorMatching[blockColorLocation]
                    .color;
                } else if (
                  blockColorLocation === -1 &&
                  this.state.colorMatching.length > 16 &&
                  this.state.colorMatching.length % 16 === 0
                ) {
                  // Start the color loop again.
                  this.state.colorMatching.push({
                    type: indexValue.type,
                    color: 0,
                  });
                  blockColor = 0;
                } else if (
                  this.state.colorMatching.length > 16 &&
                  blockColorLocation === -1
                ) {
                  // Increment on previous value.
                  this.state.colorMatching.push({
                    type: indexValue.type,
                    color:
                      this.state.colorMaching[this.state.colorMatching.length]
                        .color + 1,
                  });
                  blockColor = this.state.colorMatching.length - 1;
                } else if (
                  this.state.colorMatching.length < 16 &&
                  blockColorLocation === -1
                ) {
                  // Increment on previous value.
                  blockColor = this.state.colorMatching.length;
                  this.state.colorMatching.push({
                    type: indexValue.type,
                    color: blockColor,
                  });
                }

                let isSelected = false;
                if (
                  this.props.store.editors.get(
                    this.props.store.editorPanel.activeEditorId,
                  ).selectedBlock === index
                ) {
                  isSelected = true;
                }
                return (
                  <Block
                    key={'key-' + index} //eslint-disable-line
                    listPosition={index}
                    selected={isSelected}
                    positionType={posType}
                    color={blockColor}
                    type={indexValue.type}
                    status={indexValue.status}
                    moveBlock={this.moveBlock}
                    onClickCallback={this.selectBlock}
                    onClickCloseCallback={this.removeBlock}
                    concrete
                  />
                );
              })}
            <LastBlockTarget />
          </ul>
        ) : (
          <div className="loaderWrapper">
            <div className="loader" />
          </div>
        )}
      </div>
    );
  }
}
