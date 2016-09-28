'use strict';

let angular = require('angular');
import {HealthCheckTemplate} from '../templates.ts';

module.exports = angular.module('spinnaker.deck.httpLoadBalancer.healthCheck.component', [
    require('../../../../../core/utils/lodash.js'),
    require('../../../../../core/cache/cacheInitializer.js'),
    require('../../../../../core/cache/infrastructureCaches.js'),
  ])
  .component('gceHttpLoadBalancerHealthCheck', {
    bindings: {
      command: '=',
      deleteHealthCheck: '&',
      healthCheck: '=',
      index: '=',
    },
    templateUrl: require('./healthCheck.component.html'),
    controller: function (_) {
      this.max = Number.MAX_SAFE_INTEGER;
      this.backingData = this.command.backingData;
      let loadBalancer = this.command.loadBalancer;
      let healthChecksByName = this.backingData.healthChecksKeyedByName;

      this.onHealthCheckSelect = (selectedHealthCheck) => {
        assign(selectedHealthCheck);
      };

      this.onHealthCheckNameChange = (typedName) => {
        let matchingHealthCheck = healthChecksByName[typedName];
        if (matchingHealthCheck) {
          this.editExisting = true;
          assign(matchingHealthCheck);
        }
      };

      this.toggleEditExisting = () => {
        this.editExisting = !this.editExisting;
        if (!this.editExisting) {
          assign(new HealthCheckTemplate());
        }
      };

      if (healthChecksByName[this.healthCheck.name]) {
        this.editExisting = true;
      }

      let assign = (toAssign) => {
        loadBalancer.healthChecks[this.index] = this.healthCheck = toAssign;
      };
    }
  });
