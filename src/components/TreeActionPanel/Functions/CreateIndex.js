/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-03T16:14:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T12:12:33+10:00
 */

export const CreateIndex = {
  executeCommand: null,
  setExecuteFunction: (cbFuncExecute) => {
    CreateIndex.executeCommand = cbFuncExecute;
  },
  // Prefill function for alter user
  dbenvy_CreateIndexPreFill: (params) => {
    const data = {};
    data.Database = params.Database;
    data.CollectionName = params.CollectionName;
    data.Unique = 'false';
    data.Background = 'false';
    data.Sparse = 'false';
    return data;
  }
};
