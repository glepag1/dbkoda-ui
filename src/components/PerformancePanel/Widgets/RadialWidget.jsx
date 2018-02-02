/**
 * Created by joey on 17/1/18.
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-02T11:33:40+11:00
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
 *
 * @flow
 */

import * as d3 from 'd3';
import React from 'react';
import {inject, observer} from 'mobx-react';
import {autorun} from 'mobx';
import _ from 'lodash';

import './RadialWidget.scss';
import Widget from './Widget';

@inject(({store, api}, {widget}) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class RadialWidget extends React.Component<Object, Object> {
  static colors = ['#8A4148'];
  static width = 500;
  static height = 500;
  static PI = 2 * Math.PI;

  itemValue: number;
  field: Object;
  radial: ?HTMLElement;

  constructor(props: Object) {
    super(props);
    this.state = {width: RadialWidget.width, height: RadialWidget.height};
    this.itemValue = 0;
  }

  dataset = () => {
    return [
      {index: 0, name: 'move', icon: '\uF105', percentage: this.itemValue}
    ];
  };

  _getInnerRadiusSize() {
    const minValue = Math.min(this.state.width, this.state.height);
    return minValue / 4;
  }

  _getOuterRadiusSize() {
    const minValue = Math.min(this.state.width, this.state.height);
    return this._getInnerRadiusSize() + minValue / 10;
  }

  buildWidget() {
    const background = d3.arc()
      .startAngle(0)
      .endAngle(RadialWidget.PI)
      .innerRadius(this._getInnerRadiusSize())
      .outerRadius(this._getOuterRadiusSize());

    const elem = d3.select(this.radial);
    // elem.select('.radial-main').selectAll('svg').remove();
    // d3.transition();

    const svg = elem.select('.radial-main').append('svg')
      .attr('width', this.state.width)
      .attr('height', this.state.height)
      .append('g')
      .attr('transform', 'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')');

    const gradient = svg.append('svg:defs')
      .append('svg:linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '50%')
      .attr('y2', '0%')
      .attr('spreadMethod', 'pad');

    gradient.append('svg:stop')
      .attr('offset', '0%')
      .attr('stop-color', '#BD4133')
      .attr('stop-opacity', 1);

    gradient.append('svg:stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8A4148')
      .attr('stop-opacity', 1);


    // add some shadows
    const defs = svg.append('defs');

    const filter = defs.append('filter')
      .attr('id', 'dropshadow');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const field = svg.selectAll('g')
      .data(this.dataset)
      .enter().append('g');

    field.append('path').attr('class', 'progress').attr('filter', 'url(#dropshadow)');

    // render background
    field.append('path').attr('class', 'bg')
      .style('fill', RadialWidget.colors[0])
      .style('opacity', 0.2)
      .attr('d', background);

    // field.append('text').attr('class', 'icon');

    field.append('text').attr('class', 'completed').attr('transform', 'translate(0,0)');
    this.field = field;
    d3.transition().duration(1000).each(() => this.update());

    return field;
  }

  arcTween(d: Object) {
    const i = d3.interpolateNumber(d.previousValue, d.percentage);
    return (t: Object) => {
      d.percentage = i(t);
      return this.arc()(d);
    };
  }

  arc() {
    return d3.arc()
      .startAngle(0)
      .endAngle((d) => {
        return d.percentage / 100 * RadialWidget.PI;
      })
      .innerRadius(this._getInnerRadiusSize())
      .outerRadius(this._getOuterRadiusSize())
      .cornerRadius((this._getOuterRadiusSize() - this._getInnerRadiusSize()) / 2);
  }


  update() {
    this.field = this.field
      .each(function (d) {
        this._value = d.percentage;
      })
      .data(this.dataset)
      .each(function (d) {
        d.previousValue = this._value;
      });

    this.field.select('path.progress').transition().duration(1000)
    // .ease('elastic')
      .attrTween('d', this.arcTween.bind(this))
      .style('fill', 'url(#gradient)');

    this.field.select('text.completed').text((d) => {
      return d.percentage + '%';
    });
  }

  componentDidMount() {
    setTimeout(() => this.buildWidget(), 200);
    autorun(() => {
      const {items, values} = this.props.widget;
      const latestValue = values.length > 0 ? values[values.length - 1].value : {};
      if (!_.isEmpty(latestValue)) {
        const v = latestValue[items[0]];
        const fixedValue = _.isInteger(v) ? v : parseInt(v, 10);
        this.itemValue = fixedValue;
        this.update();
      }
    });
  }

  removeD3 = () => {
    if (this.radial) {
      const elem = d3.select(this.radial);
      elem.select('.radial-main').selectAll('svg').remove();
    }
  };

  componentWillUnmount() {
    this.removeD3();
  }

  _onResize = (width: number, height: number) => {
    this.setState({
      width,
      height
    });
    this.buildWidget();
  };

  render() {
    const {widget, widgetStyle} = this.props;
    const {displayName} = widget;

    // 1. render container for d3 in this render function
    // 2. draw d3 graph in a separate function after componentDidMount
    // 3. incremental redraw whenever data change happens
    // 4. re-draw whole graph whenver size/dimension changes
    // 5. destroy container in componentWillUnmount
    //
    // in this way, d3's render logic is detached from react's render logic. So a re-render of d3
    // container won't trigger re-render whole d3 graph. d3 has its own way of efficent DOM
    // manipulation inside its container created by react

    return (
      <Widget widget={widget} widgetStyle={widgetStyle} onResize={this._onResize}>
        <div className="RadialWidget" ref={radial => (this.radial = radial)}>
          <div className="display-name">{displayName}</div>
          <div className="radial-main" />
        </div>
      </Widget>
    );
  }
}
