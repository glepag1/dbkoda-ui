/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-12T13:49:00+10:00
 */

import React from 'react';
import {inject, observer} from 'mobx-react';
import {DropTarget} from 'react-dnd';
import {DragItemTypes} from '#/common/Constants.js';
import TreeDropActions from '#/TreePanel/model/TreeDropActions.js';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {AnchorButton, ContextMenuTarget, Intent, Menu, MenuItem} from '@blueprintjs/core';
import CodeMirror from 'react-codemirror';
import {Broker, EventType} from '../../helpers/broker';

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/edit/matchbrackets.js');
require('codemirror/addon/edit/closebrackets.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/javascript-hint.js');
require('codemirror/keymap/sublime.js');
require('#/common/MongoScript.js');

/**
 * terminalTarger object for helping with drag and drop actions?
 */
const terminalTarget = {
  /**
   * drop method for dropping items into editor.
   * @param {} props - Properties of the DropTarget.
   * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
   */
  drop(props, monitor) {
    console.log('DROP  Terminal monitor.getItem:', monitor.getItem());
    const item = monitor.getItem();
    props.onDrop(item);
  }
};

/**
 * Collect the information required by the connector and inject it into the react component as props
 * @param {} connect - connectors let you assign one of the predefined roles (a drag source, a drag preview, or a drop target) to the DOM nodes
 * @param {} monitor - keeps the state of drag process, e.g object which is being dragged
 */
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({shallow: true})
  };
}

@inject('store')
@observer
@ContextMenuTarget
class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      command: '',
      historyCursor: this
        .props
        .store
        .outputs
        .get(this.props.id)
        .commandHistory
        .length,
      terminalOptions: {
        mode: 'MongoScript',
        matchBrackets: true,
        autoCloseBrackets: true,
        json: true,
        jsonld: true,
        scrollbarStyle: null,
        keyMap: 'sublime',
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-E': () => {
            this.sendCommandToEditor();
          }
        },
        smartIndent: true,
        theme: 'ambiance',
        typescript: true
      }
    };

    this.updateCommand = this
      .updateCommand
      .bind(this);
    this.interceptCommand = this
      .interceptCommand
      .bind(this);
    this.showPreviousCommand = this
      .showPreviousCommand
      .bind(this);
    this.showNextCommand = this
      .showNextCommand
      .bind(this);
    this.updateHistory = this
      .updateHistory
      .bind(this);

    /**
     * Reaction function for when a change occurs on the dragItem.drapDrop state.
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    const reactionToDragDrop = reaction( //eslint-disable-line
    // eslint-disable-line
    () => this.props.store.dragItem.dragDropTerminal, (dragDropTerminal) => { //eslint-disable-line
      // eslint-disable-line
      if (this.props.store.editorPanel.activeEditorId == this.props.id && this.props.store.dragItem.dragDropTerminal) {
        console.log('Terminal Title:', this.props.title);
        console.log('Terminal Id: ', this.props.id);
        console.log('Active Editor Id: ', this.props.store.editorPanel.activeEditorId);
        console.log('Drag Item: ', this.props.store.dragItem.item);
        this.setState({command: TreeDropActions.getCodeForTreeNode(this.props.store.dragItem.item)});
      }
    this.props.store.dragItem.dragDropTerminal = false;
    });

    /**
     * Reaction to fire off execution of Terminal Commands
     */
    reaction(() => this.props.store.outputPanel.executingTerminalCmd, (executingTerminalCmd) => {
      if (executingTerminalCmd && this.props.id == this.props.store.editorPanel.activeEditorId) {
        this.updateHistory(this.state.command);
        const command = this.interceptCommand(this.state.command);
        console.log(command);
        if (command) {
          console.log('Sending data to feathers id ', this.props.connId, ': ', this.props.shellId, command, '.');
          this.props.store.editorToolbar.isActiveExecuting = true;
          this
            .props
            .store
            .editors
            .get(this.props.id)
            .executing = true;
          const service = featherClient().service('/mongo-shells');
          service.timeout = 30000;
          Broker.on(EventType.createShellExecutionFinishEvent(this.props.connId, this.props.shellId), this.finishedExecution);
          service.update(this.props.connId, {
            shellId: this.props.shellId,
            commands: command
          });
        }
        this.setState({command: ''});
        this.props.store.outputPanel.executingTerminalCmd = false;
      }
    }, {name: 'reactionOutputTerminalExecuteCmd'});
  }

  /**
   * Lifecycle function. Adds event handling for terminal single-line editor
   * post-render, tapping into CodeMirror's js API
   */
  componentDidMount() {
    const cm = this
      .terminal
      .getCodeMirror();
    cm.on('keydown', (cm, keyEvent) => {
      if (keyEvent.keyCode == 38) {
        // Up
        this.showPreviousCommand();
      } else if (keyEvent.keyCode == 40) {
        // Down
        this.showNextCommand();
      }
    });
    cm.on('beforeChange', (cm, changeObj) => {
      // If typed new line, attempt submit
      const typedNewLine = changeObj.origin == '+input' && typeof changeObj.text == 'object' && changeObj
        .text
        .join('') == '';
      if (typedNewLine) {
        if (this.props.store.editorToolbar.noActiveProfile) {
          return changeObj.cancel();
        }
        this.executeCommand();
        return changeObj.cancel();
      }
      // Remove pasted new lines
      const pastedNewLine = changeObj.origin == 'paste' && typeof changeObj.text == 'object' && changeObj.text.length > 1;
      if (pastedNewLine) {
        const newText = changeObj
          .text
          .join(' ');
        return changeObj.update(null, null, [newText]);
      }
      // Otherwise allow input untouched
      return null;
    });
  }

  /**
   * Get a less recent command from the history
   */
  showPreviousCommand() {
    if (this.state.historyCursor > 0) {
      this.state.historyCursor -= 1;
      this.updateCommand(this.props.store.outputs.get(this.props.id).commandHistory[this.state.historyCursor]);
    }
  }

  /**
   * Get a more recent command from the history
   */
  showNextCommand() {
    if (this.state.historyCursor < this.props.store.outputs.get(this.props.id).commandHistory.length - 1) {
      this.state.historyCursor += 1;
      this.updateCommand(this.props.store.outputs.get(this.props.id).commandHistory[this.state.historyCursor]);
    } else {
      this.setState({command: ''});
    }
  }

  /**
   * Adds a command to the commandHistory and updates the historyCursor
   */
  updateHistory(command) {
    this
      .props
      .store
      .outputs
      .get(this.props.id)
      .commandHistory
      .push(command);
    this.state.historyCursor = this
      .props
      .store
      .outputs
      .get(this.props.id)
      .commandHistory
      .length;
  }

  /**
   * Keeps the command code up-to-date with the state of CodeMirror
   * @param {string} newCmd - The updated code to be stored in state
   */
  updateCommand(newCmd) {
    this.setState({command: newCmd});
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    console.log('Set executingTerminalCmd = true');
    if (this.state.command) {
      this.props.store.outputPanel.executingTerminalCmd = true;
    }
  }

  /**
   * Checks for commands that can be run locally before passing on
   */
  interceptCommand(command) {
    if (['clear', 'cls'].indexOf(command) >= 0) {
      this.props.store.outputPanel.clearingOutput = true;
      return false;
    }
    if (['it', 'show more'].indexOf(command) >= 0) {
      this.props.store.outputPanel.executingShowMore = true;
      return false;
    }
    return command;
  }

  /**
   *
   */
  @action.bound
  sendCommandToEditor() {
    if (this.state.command) {
      this.props.store.outputPanel.sendingCommand = this.state.command;
      this.setState({
        command: '',
        historyCursor: this
          .props
          .store
          .outputs
          .get(this.props.id)
          .commandHistory
          .length
      });
      console.log('Send command to editor: ' + this.props.store.outputPanel.sendingCommand);
    }
  }

  @action.bound
  finishedExecution() {
    this
      .props
      .store
      .editors
      .get(this.props.id)
      .executing = false;
    if (this.props.store.editorPanel.activeEditorId == this.props.id) {
      this.props.store.editorToolbar.isActiveExecuting = false;
      this.props.store.editorPanel.stoppingExecution = false;
    }
  }

  renderContextMenu() {
    return (
      <Menu>
        <MenuItem
          onClick={this.sendCommandToEditor}
          text="Send Command to Editor"
          iconName="pt-icon-chevron-up"
          intent={Intent.NONE} />
      </Menu>
    );
  }

  render() {
    const {connectDropTarget, isOver} = this.props; // eslint-disable-line
    return connectDropTarget(
      <div className="outputTerminal">
        <CodeMirror
          className="outputCmdLine"
          ref={(c) => {
          this.terminal = c;
        }}
          options={this.state.terminalOptions}
          value={this.state.command}
          onChange={value => this.updateCommand(value)} />
        <AnchorButton
          className="executeCmdBtn pt-button pt-icon-key-enter"
          disabled={this.props.store.editorToolbar.noActiveProfile}
          onClick={this.executeCommand} />
      </div>
    );
  }
}

export default DropTarget(DragItemTypes.LABEL, terminalTarget, collect)(Terminal);
