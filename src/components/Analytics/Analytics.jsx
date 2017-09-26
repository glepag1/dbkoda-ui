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
 * @Author: chris
 * @Date:   2017-06-20T15:09:51+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-27T13:52:32+10:00
 */
import React from 'react';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import ReactGA from 'react-ga';
import { analytics, protocol } from '../../env';
import { AnalyticsEvents } from './Events';
import { Broker, EventType } from '../../helpers/broker';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Analytics extends React.Component {
  constructor(props) {
    super(props);
    let siteUrl = '';
    const gaCode = analytics;
    if (process.env.NODE_ENV === 'development') {
      siteUrl = protocol + 'dev.dbkoda.com';
      ReactGA.initialize(gaCode.development, {
        debug: true,
        titleCase: false,
      });
    } else if (process.env.NODE_ENV === 'production') {
      siteUrl = protocol + 'electron.dbkoda.com';
      ReactGA.initialize(gaCode.prod, {
        titleCase: false,
      });
    }
    ReactGA.set({ page: siteUrl });

    if (this.props.store.userPreferences.telemetryEnabled) {
      // TODO Get shellVersion
      const shellVersion = '';
      this._sendEvent(AnalyticsEvents.APP_OPEN, 'App', shellVersion);
    }

    /**
     * Reaction function for when a change occurs on the telemetryEnabled state
     * @param {function()} - The state that will trigger the reaction.
     * @param {function()} - The reaction to any change on the state.
     */
    reaction(
      () => this.props.store.userPreferences.telemetryEnabled,
      (telemetryEnabled) => {
        if (telemetryEnabled) {
          this._sendEvent(AnalyticsEvents.OPT_IN, 'App');
        } else {
          this._sendEvent(AnalyticsEvents.OPT_OUT, 'App');
        }
      },
      { name: 'analyticsReactionToTelemetryChange' },
    );

    this._sendEvent = this._sendEvent.bind(this);
    this.newProfileCreated = this.newProfileCreated.bind(this);
    this.feedbackEvent = this.feedbackEvent.bind(this);
  }

  componentDidMount() {
    Broker.on(EventType.NEW_PROFILE_CREATED, this.newProfileCreated);
    Broker.on(EventType.FEEDBACK, this.feedbackEvent);
  }

  componentWillUnmount() {
    Broker.off(EventType.NEW_PROFILE_CREATED, this.newProfileCreated);
    Broker.off(EventType.FEEDBACK, this.feedbackEvent);
  }

  /**
   *  Function to be called after a new profile event has been received
   *  @param {Object} profile - An object that represents the newly created profile
   */
  newProfileCreated(profile) {
    const mongoVersion = profile.dbVersion;
    this._sendEvent(AnalyticsEvents.NEW_PROFILE, 'Profiles', mongoVersion);
  }

  /**
   * function to be called when feedback is recieved
   * @param {String} comments - Any additional comments to be sent with the feedback.
   */
  feedbackEvent(feedback) {
    this._sendEvent(
      AnalyticsEvents[feedback.type],
      'Comments',
      feedback.comments,
    );
  }

  /**
   *  Function to send an event to the analytics service
   *  @param {AnalyticsEvent} eventType - The AnalyticsEvent type that relates to this event
   *  @param {String} eventLabel - (Optional) The 'label' of the event (could be an item it relates to)
   *  @param {String} eventValue - (Optional) The 'value' of the event (could be the value of an item)
   *  @param {String} eventCategory - (Optional) The overarching category of the event type
   */
  _sendEvent(eventType, eventCategory, eventLabel, eventValue) {
    const event = {
      category: eventCategory,
      action: eventType,
    };
    if (eventLabel) {
      event.label = eventLabel;
    }
    if (eventValue) {
      event.value = eventValue;
    }
    ReactGA.event(event);
  }

  render() {
    return <div className="analytics" />;
  }
}
