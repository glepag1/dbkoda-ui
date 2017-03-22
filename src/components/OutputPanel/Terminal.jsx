/**
 * @Author: chris
 * @Date:   2017-03-22T11:31:55+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-23T09:17:51+11:00
 */

import React from 'react';
import {inject, observer} from 'mobx-react';
import {action, reaction} from 'mobx';
import {featherClient} from '~/helpers/feathers';
import {AnchorButton} from '@blueprintjs/core';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');

inject('store')
@observer
export default class Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      command: ''
    };
    this.updateCommand = this.updateCommand.bind(this);
  }

  /**
   * Keeps the command code up-to-date with the state of CodeMirror
   * @param {string} newCmd - The updated code to be stored in state
   */
  updateCommand(newCmd) {
    this.setState({ command: newCmd });
  }

  /**
   * Executes the command typed into the terminal editor
   */
  @action.bound
  executeCommand() {
    const command = this.state.command;
    console.log('Sending data to feathers id ', this.props.id, ': ', this.props.shellId, command, '.');
    const service = featherClient().service('/mongo-shells');
    service.timeout = 30000;
    service.update(parseInt(this.props.id), {
      shellId: parseInt(this.props.shellId), // eslint-disable-line
      commands: command
    });
    this.setState({ command: '' });
  }

  /**
   * Lifecycle function. Adds event handling for terminal single-line editor
   * post-render, tapping into CodeMirror's js API
   */
  componentDidMount() {
    var cm = this.refs.terminal.getCodeMirror();
    cm.on("beforeChange", (cm, changeObj) => {
      // If typed new line, attempt submit
      var typedNewLine = (changeObj.origin == '+input' &&
                          typeof changeObj.text == "object" &&
                          changeObj.text.join("") == "");
      if (typedNewLine) {
        // TODO call execute command
        this.executeCommand();
        return changeObj.cancel();
      }
      // Remove pasted new lines
      var pastedNewLine = (changeObj.origin == 'paste' &&
                          typeof changeObj.text == "object" &&
                          changeObj.text.length > 1);
      if (pastedNewLine) {
        var newText = changeObj.text.join(" ");
        return changeObj.update(null, null, [newText]);
      }
      // Otherwise allow input untouched
      return null;
    });
  }

  render() {
    const terminalOptions = {
      mode: 'text/javascript',
      matchBrackets: true,
      json: true,
      jsonld: true,
      scrollbarStyle: null,
      smartIndent: true,
      theme: 'ambiance',
      typescript: true,
    };

    return (
      <div className="outputTerminal">
        <CodeMirror
          className="outputCmdLine"
          ref="terminal"
          options={terminalOptions}
          value={this.state.command}
          onChange={value => this.updateCommand(value)}
          />
        <AnchorButton
          className="executeCmdBtn pt-button pt-icon-key-enter"
          onClick={this.executeCommand}
          />
      </div>
    );
  }
}
