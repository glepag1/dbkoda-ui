/*
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

/**
 * @Author: mike
 * @Date:   2017-02-15 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:22:02
 */
import { Position, Toaster } from '@blueprintjs/core';

export const NewToaster = Toaster.create({
  className: 'dbkoda-toaster',
  position: Position.TOP_RIGHT,
});

export const DBKodaToaster = () => {
  return NewToaster;
};
