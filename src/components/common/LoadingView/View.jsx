/**
 * @flow
 *
 * @Author: guiguan
 * @Date:   2017-10-09T15:41:06+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-14T16:27:45+11:00
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
import './View.scss';

export default class LoadingView extends React.PureComponent<*> {
  render() {
    return (
      <div className="LoadingView">
        <div className="Spinner" />
      </div>
    );
  }
}
