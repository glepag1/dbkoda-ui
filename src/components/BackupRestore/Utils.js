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

import os from 'os';
import {BackupRestoreActions} from '../common/Constants';

export const isDumpAction = action => BackupRestoreActions.DUMP_COLLECTION === action || action === BackupRestoreActions.DUMP_DATABASE || action === BackupRestoreActions.DUMP_SERVER;

export const isExportAction = action => BackupRestoreActions.EXPORT_COLLECTION === action || action === BackupRestoreActions.EXPORT_DATABASE;

export const isRestoreAction = action => BackupRestoreActions.RESTORE_COLLECTION === action || action === BackupRestoreActions.RESTORE_DATABASE || action === BackupRestoreActions.RESTORE_SERVER;

export const isImportAction = action => BackupRestoreActions.IMPORT_COLLECTION === action || action === BackupRestoreActions.IMPORT_DATABASE;

export const isServerAction = action => BackupRestoreActions.DUMP_SERVER === action || BackupRestoreActions.DUMP_SERVER;

export const isCollectionAction = treeAction => treeAction === BackupRestoreActions.EXPORT_COLLECTION || treeAction === BackupRestoreActions.DUMP_COLLECTION
  || treeAction === BackupRestoreActions.RESTORE_COLLECTION || treeAction === BackupRestoreActions.IMPORT_COLLECTION;

export const isDatabaseAction = treeAction => treeAction === BackupRestoreActions.EXPORT_DATABASE || treeAction === BackupRestoreActions.DUMP_DATABASE
  || treeAction === BackupRestoreActions.RESTORE_DATABASE || treeAction === BackupRestoreActions.IMPORT_DATABASE;

export const getDialogProperites = (action) => {
  let properties = [];

  if (action === BackupRestoreActions.RESTORE_COLLECTION || action === BackupRestoreActions.IMPORT_COLLECTION
    || action === BackupRestoreActions.IMPORT_DATABASE) {
    // On Windows and Linux an open dialog can not be both a file selector and a directory selector, so if you set properties to ['openFile', 'openDirectory'] on these platforms, a directory selector will be shown.
    if (os.release().indexOf('Mac') >= 0) {
      properties = ['openFile', 'openDirectory'];
    } else {
      properties = ['openFile'];
    }
  } else {
    properties = ['openDirectory'];
  }

  properties.push('createDirectory');
  properties.push('promptToCreate');
  return properties;
};
