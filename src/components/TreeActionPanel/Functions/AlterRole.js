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
 *
 * @Author: chris
 * @Date:   2017-09-12T09:19:17+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-13T11:42:50+10:00
 */

export const AlterRole = {
  // Prefill function for alter role
  dbkoda_AlterRolePreFill: (params) => {
    const data = {};
    console.log(params);
    data.RoleName = params.RoleName;
    return data;
  },
  dbkoda_validateAlterRole: (inputDoc) => {
    if (!Object.prototype.hasOwnProperty.call(inputDoc, 'RoleName')) {
      throw new Error('dbkoda: Drop Role requires the name of the role to drop');
    }
    return true;
  }
};
