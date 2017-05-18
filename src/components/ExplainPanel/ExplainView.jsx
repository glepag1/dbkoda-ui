/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';
import CodeMirror from 'react-codemirror';
import CM from 'codemirror';
import Prettier from 'prettier';

import './style.scss';

export const Stage = ({stage}) => {
  return (<div className="explain-stage">
    {stage.stage}
  </div>);
};

export const StageProgress = ({stages}) => {
  return (<div className="explain-stage-progress">
    {
      stages.map((stage) => {
        return (<Stage stage={stage} key={stage.stage} />);
      })
    }
  </div>);
};

/**
 * get execution stages array
 */
export const getExecutionStages = (executionStages) => {
  const stages = [];
  if (executionStages) {
    let currentStage = executionStages;
    while (currentStage) {
      stages.push(currentStage);
      currentStage = currentStage.inputStage;
    }
  }
  return stages.reverse();
};

export const generateComments = (stage) => {
  let comments = 'waiting for comments ' + stage.stage;
  if (stage.stage.indexOf('SORT_KEY_GENERATOR') >= 0) {
    comments = 'Generate keys for the next sort step';
  }

  return comments;
};

export const StepsTable = ({stages}) => {
  return (<div className="explain-stages-table">
    <div className="stage-header">
      <div className="column-header">Seq</div>
      <div className="column-header">Step</div>
      <div className="column-header">ms</div>
      <div className="column-header">Examined</div>
      <div className="column-header">Return</div>
      <div className="column-header">Comment</div>
    </div>
    {
      stages.map((stage, i) => {
        return (<div className="stage-row" key={stage.stage}>
          <div className="stage-cell">{i + 1}</div>
          <div className="stage-cell">{stage.stage}</div>
          <div className="stage-cell">
            <div className="text">{stage.executionTimeMillisEstimate}</div>
          </div>
          <div className="stage-cell">
            <div className="text">{stage.stage === 'IXSCAN' ? stage.keysExamined : stage.docsExamined}</div>
          </div>
          <div className="stage-cell">
            <div className="text">{stage.nReturned}</div>
          </div>
          <div className="stage-cell">{generateComments(stage)}</div>
        </div>);
      })
    }
  </div>);
};

const StatisicView = ({explains}) => {
  const {executionStats} = explains;
  return (<div className="explain-statistic-view">
    <div className="header">
      <div>Statistic</div>
      <div>Value</div>
    </div>
    <div className="row">
      <div>Total Docs Returned</div>
      <div>{executionStats.nReturned}</div>
    </div>
    <div className="row">
      <div>Total Keys Examined</div>
      <div>{executionStats.totalKeysExamined}</div>
    </div>
    <div className="row">
      <div>Total Docs Examined</div>
      <div>{executionStats.totalDocsExamined}</div>
    </div>
  </div>);
};

const options = {
  smartIndent: true,
  theme: 'material',
  readOnly: true,
  lineWrapping: false,
  tabSize: 2,
  matchBrackets: true,
  keyMap: 'sublime',
  mode: 'MongoScript'
};

const CommandPanel = ({command, namespace}) => {
  const formatted = Prettier.format(command, {});
  return (<div className="explain-command-panel">
    <div className="namespace">
      <div className="label">Namespace:</div>
      <div className="value">{namespace}</div>
    </div>
    <div className="codemirror">
      <div className="label">Query:</div>
      <CodeMirror
        codeMirrorInstance={CM}
        value={formatted}
        options={options} />
    </div>
  </div>);
};

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const commandPanel = <CommandPanel command={explains.command} namespace={output.queryPlanner.namespace} />;
  if (!output.executionStats) {
    const stages = getExecutionStages(output.queryPlanner.winningPlan);
    return (<div className="explain-view-panel">
      <StageProgress stages={stages} />
      {commandPanel}
    </div>);
  }
  const stages = getExecutionStages(output.executionStats.executionStages);
  return (<div className="explain-view-panel">
    <StageProgress stages={stages} />
    <StepsTable stages={stages} />
    <StatisicView explains={output} />
    {commandPanel}
  </div>);
};

export default ExplainView;
