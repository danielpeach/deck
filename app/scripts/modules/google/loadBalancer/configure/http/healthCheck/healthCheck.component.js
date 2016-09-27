'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.httpLoadBalancer.healthCheck.component', [
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
    controller: function (_) {
      this.max = Number.MAX_SAFE_INTEGER;

      this.onHealthCheckSelect = (healthCheck) => {
        _.assign(this.renderedData.healthChecks[this.index], healthCheck);
      };

      this.onHealthCheckNameChange = (healthCheckName) => {
        if (this.backingData.healthChecksKeyedByName[healthCheckName]) {
          this.editExisting = true;
          _.assign(
            this.renderedData.healthChecks[this.index],
            this.backingData.healthChecksKeyedByName[healthCheckName]);
        }
      };

      this.toggleEditExisting = () => {
        this.editExisting = !this.editExisting;
        if (!this.editExisting) {
          _.assign(this.renderedData.healthChecks[this.index], this.healthCheck);
          delete this.healthCheck.name;
        }
      };

      if (this.backingData.healthChecksKeyedByName[this.healthCheck.name]) {
        this.editExisting = true;
      }
    }
  });
