'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.listener.component', [
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gceListener', {
    bindings: {
      command: '=',
      listener: '=',
      deleteListener: '&',
      index: '=',
      application: '=',
    },
    templateUrl: require('./listener.component.html'),
    controller: function (_) {
      this.certificates = this.command.backingData.certificates;

      this.certificateRequired = (port) => port === 443;

      this.getName = (listener, applicationName) => {
        let listenerName = [applicationName, (listener.stack || ''), (listener.detail || '')].join('-');
        return _.trimRight(listenerName, '-');
      };

      this.updateName = (listener, appName) => {
        listener.name = this.getName(listener, appName);
      };

      this.existingListenerNames = () => {
        return _.without(this.command.loadBalancer.listeners, this.listener).map((listener) => listener.name);
      };

      if (!this.listener.name) {
        this.updateName(this.listener, this.application.name);
      }
    }
  });
