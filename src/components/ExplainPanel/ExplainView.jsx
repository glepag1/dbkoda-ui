/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';
// import {Button, Popover, PopoverInteractionKind, Position} from '@blueprintjs/core';
// import JSONTree from 'react-json-tree';
// import {theme} from './JsonTreeTheme';
import './style.scss';
// import {Types} from './Types';

export const Stage = ({stage}) => {
  return (<div className="explain-stage" >
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
  return 'waiting for comments ' + stage.stage;
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
          <div className="stage-cell">{stage.executionTimeMillisEstimate}</div>
          <div className="stage-cell">{stage.stage === 'IXSCAN' ? stage.keysExamined : stage.docsExamined}</div>
          <div className="stage-cell">{stage.nReturned}</div>
          <div className="stage-cell">{generateComments(stage)}</div>
        </div>);
      })
    }
  </div>);
};

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const stages = getExecutionStages(output.executionStats.executionStages);

  return (<div className="explain-view-panel">
    <StageProgress stages={stages} />
    <StepsTable stages={stages} />
  </div>);
};

export default ExplainView;
