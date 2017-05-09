/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-19T15:43:32+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T12:52:49+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import { Intent, Position, Tooltip } from '@blueprintjs/core';

export default observer(({
  field,
  showLabel = true,
  formGroup = false
}) => {
  const fldClassName = formGroup
    ? 'pt-form-group form-group-inline'
    : 'pt-form-group pt-inline';
  let inputClassName = 'pt-input';
  let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
  if (formGroup) {
    if (field.options && field.options.tooltip) {
      tooltipClassName += ' table-field-90';
      inputClassName += ' table-field-100';
    } else {
      inputClassName += ' table-field-90';
    }
  }
  return (
    <div className={fldClassName}>
      {showLabel &&
        <label className="pt-label pt-label-r-30" htmlFor={field.id}>
          {field.label}
        </label>}
      <div className="pt-form-content">
        {field.options &&
          field.options.tooltip &&
          <Tooltip
            className={tooltipClassName}
            content={field.options.tooltip}
            inline
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            <input className={inputClassName} {...field.bind()} type="text" />
          </Tooltip>}
        {(!field.options || !field.options.tooltip) &&
          <input className={inputClassName} {...field.bind()} type="text" />}
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
