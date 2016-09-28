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
      let healthChecksByNameCopy = this.backingData.healthChecksKeyedByNameCopy;

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

      let getPlain = (healthCheck) => {
        let copy = _.cloneDeep(healthCheck);
        return {
          checkIntervalSec: copy.checkIntervalSec,
          healthyThreshold: copy.healthyThreshold,
          port: copy.port,
          name: copy.name,
          requestPath: copy.requestPath,
          unhealthyThreshold: copy.unhealthyThreshold,
          timeoutSec: copy.timeoutSec,
          creationTimestamp: copy.creationTimestamp,
          description: copy.description,
          host: copy.host,
          id: copy.id,
          kind: copy.kind,
          selfLink: copy.selfLink,
        };
      };

      this.showModifiedWarning = () => {
        let originalHealthCheck = healthChecksByNameCopy[this.healthCheck.name];
        return originalHealthCheck && !_.isEqual(getPlain(this.healthCheck), originalHealthCheck);
      };

      this.revert = () => {
        let originalHealthCheck = _.cloneDeep(healthChecksByNameCopy[this.healthCheck.name]);
        assign(originalHealthCheck);
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
