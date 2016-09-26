'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.httpLoadBalancer.healthCheck.component', [
    require('../backingData.service.js'),
    require('../../../../../core/utils/lodash.js'),
    require('../../../../../core/cache/cacheInitializer.js'),
    require('../../../../../core/cache/infrastructureCaches.js'),
  ])
  .component('gceHttpLoadBalancerHealthCheck', {
    bindings: {
      backingData: '=',
      deleteHealthCheck: '&',
      healthCheck: '=',
      index: '=',
      renderedData: '=',
    },
    templateUrl: require('./healthCheck.component.html'),
    controller: function (_, gceHttpLoadBalancerBackingData) {
      this.max = Number.MAX_SAFE_INTEGER;

      this.onHealthCheckSelect = (healthCheck) => {
        _.assign(this.renderedData.healthChecks[this.index], healthCheck);
      };

      this.onHealthCheckNameChange = (healthCheckName) => {
        if (_.has(this.backingData, ['healthChecksKeyedByName', healthCheckName])) {
          this.useExisting = true;
          _.assign(
            this.renderedData.healthChecks[this.index],
            this.backingData.healthChecksKeyedByName[healthCheckName]);
        }
      };

      this.onUseExistingChange = (useExisting) => {
        debugger;
        if (!useExisting) {
          delete this.healthCheck.name;
        }
      };

      gceHttpLoadBalancerBackingData.onLoad(({ healthChecksKeyedByName }) => {
        if (healthChecksKeyedByName[this.healthCheck.name]) {
          this.useExisting = true;
        }
      });
    }
  });
