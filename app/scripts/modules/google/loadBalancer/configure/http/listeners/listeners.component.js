'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.listener.component', [])
  .component('gceListeners', {
    bindings: {
      command: '=',
    },
    templateUrl: require('./listeners.component.html'),
    controller: function () {
      this.listeners = this.command.loadBalancer.listeners;
      this.certificates = this.command.backingData.certificates;

      this.certificateRequired = (portRanges) => {
        return portRanges.includes(443);
      };
    }
  });
