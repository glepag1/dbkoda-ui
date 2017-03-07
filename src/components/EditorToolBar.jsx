import React from 'react';
import {Intent} from '@blueprintjs/core';
import {NewToaster} from './Toaster.jsx';

export default class EditorToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.addEditor = this
      .addEditor
      .bind(this);
    this.removeEditor = this
      .removeEditor
      .bind(this);
    this.executeLine = this
      .executeLine
      .bind(this);
    this.executeAll = this
      .executeAll
      .bind(this);
    this.explainPlan = this
      .explainPlan
      .bind(this);
  }

  // -------------------//
  // . TOOLBAR ACTIONS //
  // ----------------- //
  // Placeholder - Linting disabled for this line.
  addEditor() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  removeEditor() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  executeLine() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  executeAll() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  explainPlan() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  render() {
    return (
      <nav className="pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <button
              className="pt-button pt-icon-add pt-intent-primary"
              onClick={this.addEditor} />
            <button
              className="pt-button pt-icon-delete pt-intent-primary"
              onClick={this.removeEditor} />
          </div>
          <span className="pt-navbar-divider" />
          <div className="pt-button-group">
            <button
              className="pt-button pt-icon-chevron-right pt-intent-primary"
              onClick={this.executeLine} />
            <button
              className="pt-button pt-icon-double-chevron-right pt-intent-primary"
              onClick={this.executeAll} />
            <button
              className="pt-button pt-icon-help pt-intent-primary"
              onClick={this.explainPlan} />
          </div>
          <span className="pt-navbar-divider" />
          <input className="pt-input" placeholder="Search Tabs..." type="text" />
        </div>
      </nav>
    );
  }
}
