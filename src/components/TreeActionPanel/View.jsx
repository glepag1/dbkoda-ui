/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-22T12:31:00+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { DrawerPanes } from '#/common/Constants';
import FormTable from './Components/FormTable';
import TextField from './Components/TextField';
import SelectField from './Components/SelectField';
import BooleanField from './Components/BooleanField';
import NumericField from './Components/NumericField';
import ComboField from './Components/ComboField';
import FormGroup from './Components/FormGroup';

import './View.scss';

@inject(allStores => ({
  setDrawerChild: allStores.store.setDrawerChild,
  treeActionPanel: allStores.store.treeActionPanel,
  editorPanel: allStores.store.editorPanel
}))
@observer
export default class TreeActionView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {formStyle: { height: (window.innerHeight - 120)}};
  }
  componentDidMount() {
    window.addEventListener('resize', this.onResize.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
  onResize(e) {
    this.setState({formStyle: { height: (e.target.innerHeight - 120)}});
  }
  @action.bound
  close(e) {
    e.preventDefault();
    this.props.setDrawerChild(DrawerPanes.DEFAULT);
    this.props.treeActionPanel.treeActionEditorId = '';
    this.props.treeActionPanel.isNewFormValues = false;
  }
  @action.bound
  execute(e) {
    e.preventDefault();
    this.props.editorPanel.executingEditorAll = true;
  }
  render() {
    const { mobxForm, title } = this.props;
    const formFields = [];
    if (mobxForm && mobxForm.fields.size > 0) {
      for (const key of mobxForm.fields._keys) {
        if (mobxForm.fields.get(key).type == 'Text') {
          formFields.push(<TextField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Table') {
          formFields.push(<FormTable key={key} members={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Select') {
          formFields.push(<SelectField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Boolean') {
          formFields.push(<BooleanField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Numeric') {
          formFields.push(<NumericField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Combo') {
          formFields.push(<ComboField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Group') {
          formFields.push(<FormGroup key={key} field={mobxForm.$(key)} />);
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="form-title">{title}</h3>
        <form onChange={mobxForm.onValueChange(mobxForm)} style={this.state.formStyle}>
          {formFields}
          <div className="form-button-panel">
            <button
              className="pt-button pt-intent-success right-button"
              disabled={!mobxForm.isValid}
              onClick={this.execute}
            >
              Execute
            </button>
            <button
              className="pt-button pt-intent-primary right-button"
              onClick={this.close}
            >
              Close
            </button>
          </div>
          <p className="pt-form-helper-text">{mobxForm.error}</p>
        </form>
      </div>
    );
  }
}
