/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T12:51:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-30T14:58:31+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default observer(({
  field,
  data
}) => {
  console.log('BarChartField field:', field);
  console.log('BarChartField data:', data);
  const COLORS = [
    '#413456',
    '#823C1D',
    '#5D3750',
    '#77173E',
    '#0D657C',
    '#607747',
    '#107BA3',
    '#A01B4C',
    '#1E282D',
    '#465061',
    '#1E423C',
    '#701535'
  ];

  const chartBars = field.XAxis.map((bar, index) => (
    <Bar
      dataKey={bar.key}
      name={bar.label}
      fill={COLORS[index % COLORS.length]}
    />
  ));

  return (
    <div
      className="div-field-container"
      style={field.width && { width: (field.groupBy ? '100%' : field.width) }}
    >
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <ResponsiveContainer width="100%" height={field.height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis dataKey={field.YAxis.key} width={field.YAxis.width ? field.YAxis.width : 60} type="category" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend iconType="circle" />
          {chartBars}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
