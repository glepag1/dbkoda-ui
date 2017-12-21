/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T13:17:29+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T13:47:30+11:00
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

import { action, observable, type IObservableArray } from 'mobx';
import uuid from 'uuid/v1';
import autobind from 'autobind-decorator';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker'; // eslint-disable-line
import _ from 'lodash';

export const widgetErrorLevels = {
  warn: 'warn',
  error: 'error',
};

export type WidgetValue = {
  timestamp: number,
  value: { [string]: any },
};
export type WidgetErrorLevel = $Keys<typeof widgetErrorLevels>;
export type WidgetState = {
  id: UUID,
  profileId: UUID,
  items: string[],
  values: IObservableArray<WidgetValue>,
  state: ComponentState,
  errorLevel: ?WidgetErrorLevel,
  error: ?string,
};

export default class WidgetApi {
  store: *;
  api: *;
  statsService: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
    this.statsService = featherClient().statsService;
  }

  _createWidgetErrorHandler = (id: UUID) => {
    return action((err) => {
      const widget = this.store.widgets.get(id);

      if (widget) {
        _.assign(widget, {
          state: 'error',
          errorLevel: widgetErrorLevels.error,
          error: err.message,
        });
      }
    });
  };

  @action.bound
  addWidget(
    profileId: UUID,
    items: string[],
    extraState: ?{ id?: string } = null,
    statsServiceOptiopns: ?{} = null, // eslint-disable-line
  ): UUID {
    const { widgets } = this.store;

    const id = (extraState && extraState.id) || uuid();

    const widget: WidgetState = {
      id,
      profileId,
      items,
      values: observable.shallowArray(),
      state: 'loading',
      errorLevel: null,
      error: null,
      ...extraState,
    };

    widgets.set(id, observable.shallowObject(widget));

    // this.statsService
    //   .create({
    //     profileId,
    //     items,
    //     options: statsServiceOptiopns,
    //   })
    //   .then(
    //     action(() => {
    //       const widget = widgets.get(id);
    //
    //       if (widget) {
    //         widget.state = 'loaded';
    //       }
    //     }),
    //   )
    //   .catch(this._createWidgetErrorHandler(id));

    return id;
  }

  @autobind
  removeWidget(id: UUID) {
    const { widgets } = this.store;

    const widget = widgets.get(id);

    if (widget) {
      // this.statsService
      //   .remove(widget.profileId, {
      //     query: {
      //       items: widgets.items,
      //     },
      //   })
      //   .then(
      //     action(() => {
            widgets.delete(id);
        //   }),
        // )
        // .catch(this._createWidgetErrorHandler(id));
    }
  }
}