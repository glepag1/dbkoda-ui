/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:32:20+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-06T09:55:36+11:00
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

import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Responsive } from 'react-grid-layout';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';

import DataCenter from '~/api/DataCenter';

import { DialogHotkeys } from '#/common/hotkeys/hotkeyList';
import SizeProvider from '#/PerformancePanel/SizeProvider';
import TextField from '#/common/FormFields/TextField';
import NumericField from '#/common/FormFields/NumericField';
import BooleanField from '#/common/FormFields/BooleanField';
import FileField from '#/common/FormFields/FileField';

import TipsField from './TipsField';
import { ConnectionForm } from './ConnectionForm';
import './Panel.scss';

const ReactGridLayout = SizeProvider(Responsive);

type Props = {
  store: any,
  api: DataCenter
};

type State = {
  selectedSubform: string,
  formTitle: string,
  isConnecting: boolean
};
@inject(({ store, api }) => {
  return {
    store,
    api
  };
})
@observer
export default class ProfileManager extends React.Component<Props, State> {
  form: null;

  static defaultProps = {
    store: null,
    api: null
  };

  state = {
    selectedSubform: 'basic',
    formTitle: globalString('connection/createHeading'),
    isConnecting: false
  };

  constructor(props: Props) {
    super(props);

    const { store, api } = this.props;
    this.form = new ConnectionForm(api);
    if (store && store.profileList.selectedProfile) {
      this.setState({ formTitle: globalString('connection/editHeading') });
      this.form.updateSchemaFromProfile(store.profileList.selectedProfile);
    }

    this.submitDialog = this.submitDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
  }

  componentWillMount() {
    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, this.submitDialog);
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this.closeDialog);
  }

  componentWillUnmount() {
    Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, this.submitDialog);
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this.closeDialog);
  }

  submitDialog() {
    this.setState({ isConnecting: true });
    this.form
      .onConnect()
      .then(() => {
        this.setState({ isConnecting: false });
      })
      .catch(() => this.setState({ isConnecting: false }));
  }

  closeDialog() {
    const { store } = this.props;
    store.hideConnectionPane();
  }

  renderUIFields(column: number) {
    const fields = this.form.getSubformFields(
      this.state.selectedSubform,
      column
    );
    const uiFields = [];
    if (fields) {
      fields.forEach(field => {
        let uiField;
        if (field.type == 'text' || field.type == 'password') {
          uiField = <TextField key={field.name} field={field} />;
        } else if (field.type == 'number') {
          uiField = <NumericField key={field.name} field={field} />;
        } else if (field.type == 'checkbox') {
          uiField = <BooleanField key={field.name} field={field} />;
        } else if (field.type == 'file') {
          uiField = <FileField key={field.name} field={field} />;
        }

        uiFields.push(uiField);
      });
    }
    return uiFields;
  }

  renderMenu() {
    const menuBtns = [];
    const subforms = this.form.getSubForms();
    subforms.forEach(formStr => {
      const subForm = this.form.formSchema[formStr];
      const btnClassName = 'btn-' + formStr;
      menuBtns.push(
        <Button
          active={this.state.selectedSubform == formStr}
          key={formStr}
          className={btnClassName}
          onClick={() => {
            this.setState({
              selectedSubform: formStr
            });
          }}
        >
          {subForm.name}
        </Button>
      );
    });

    return (
      <ButtonGroup className="menu-btns" minimal={false} large vertical fill>
        {menuBtns}
      </ButtonGroup>
    );
  }

  render() {
    return (
      <div className="ProfileManager">
        <ReactGridLayout
          className="layout"
          layouts={{
            desktop: []
          }}
          autoSize={false}
          breakpoints={{
            desktop: 0
          }}
          cols={{
            desktop: 12
          }}
          bFitHeight
          verticalGridSize={9}
          margin={[1, 0]}
        >
          <div
            key="column0"
            data-grid={{
              x: 0,
              y: 0,
              w: 2,
              h: 9,
              static: true
            }}
          >
            <div key="column0" className="connectionLeftPane">
              <div className="connection-form">
                <div className="form-title">
                  <span>{this.state.formTitle}</span>
                </div>

                {this.renderMenu()}
              </div>
            </div>
          </div>
          <div
            key="column1"
            data-grid={{
              x: 2,
              y: 1.5,
              w: 3.5,
              h: 5.5,
              static: true
            }}
          >
            <div className="pt-dark form-scrollable">
              <form>{this.renderUIFields(1)}</form>
            </div>
          </div>
          <div
            key="column2"
            data-grid={{
              x: 5.5,
              y: 1.5,
              w: 3.5,
              h: 5.5,
              static: true
            }}
          >
            <div className="pt-dark form-scrollable">
              <form>{this.renderUIFields(2)}</form>
            </div>
          </div>
          <div
            key="column3"
            className="no-border"
            data-grid={{
              x: 9,
              y: 1.5,
              w: 3,
              h: 5.5,
              static: true
            }}
          >
            <TipsField
              tips={this.form.getSubformTips(this.state.selectedSubform)}
            />
          </div>
          <div
            key="rowBottom"
            className="no-border minus-one-z-index"
            data-grid={{
              x: 6,
              y: 7,
              w: 6,
              h: 2,
              static: true
            }}
          >
            <div className="pt-dark form-scrollable">
              <form className="formButtons">
                <div className="profile-button-panel">
                  <Button
                    className={
                      (this.form.isFormInvalid ? 'inactive' : 'active') +
                      ' connectButton pt-button pt-intent-success'
                    }
                    onClick={this.submitDialog}
                    text={globalString('connection/form/connectButton')}
                    disabled={this.form.isFormInvalid}
                    loading={this.state.isConnecting}
                  />
                </div>
                <div className="profile-button-panel">
                  <Button
                    className="save-button pt-button pt-intent-primary"
                    text={globalString('connection/form/saveButton')}
                    onClick={() => this.form.onSave()}
                  />{' '}
                  <Button
                    className={
                      (this.form.isFormInvalid ? 'inactive' : 'active') +
                      ' test-button pt-button pt-intent-primary'
                    }
                    onClick={() => this.form.onTest()}
                    text={globalString('connection/form/testButton')}
                    disabled={this.form.formErrors.length > 0}
                    loading={this.state.testing}
                  />
                  <Button
                    className="reset-button pt-button pt-intent-warning"
                    onClick={() => this.form.onReset()}
                    text={globalString('connection/form/resetButton')}
                  />
                </div>
              </form>
            </div>
          </div>
        </ReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={this.closeDialog}
        />
      </div>
    );
  }
}
