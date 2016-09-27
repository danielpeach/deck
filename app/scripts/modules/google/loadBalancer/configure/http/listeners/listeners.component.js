'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.listener.component', [])
  .component('gceListeners', {
    bindings: {
      listeners: '=',
      renderedData: '=',
      aggregateData: '=',
    },
    templateUrl: require('./listeners.component.html'),
    controller: function () {
      this.certificateRequired = (portRanges) => {
        return portRanges.includes(443);
      };
    }
  });
