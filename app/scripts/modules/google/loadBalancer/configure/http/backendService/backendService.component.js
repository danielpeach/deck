'use strict';

let angular = require('angular');
require('./../backendService.component.less');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backendService.component', [
    require('../backingData.service.js'),
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gceBackendService', {
    bindings: {
      backendService: '=',
      deleteService: '&',
      backingData: '=',
      renderedData: '=',
      index: '=',
      defaultServiceManager: '&'
    },
    templateUrl: require('./backendService.component.html'),
    controller: function (_, gceHttpLoadBalancerBackingData) {
      this.onBackendServiceSelect = (backendService) => {
        _.assign(this.renderedData.backendServices[this.index], backendService);

        if (!this.renderedData.backendServices.find((service) => service.useAsDefault)) {
          this.renderedData.backendServices[this.index].useAsDefault = true;
        }
      };

      this.onBackendServiceNameChange = (backendServiceName) => {
        if (_.has(this.backingData, ['backendServicesKeyedByName', backendServiceName])) {
          this.useExisting = true;
          _.assign(
            this.renderedData.backendServices[this.index],
            this.backingData.backendServicesKeyedByName[backendServiceName]);
        }
      };

      this.onUseExistingChange = (useExisting) => {
        if (!useExisting) {
          delete this.backendService.name;
        }
      };

      gceHttpLoadBalancerBackingData.onLoad(({ backendServicesKeyedByName }) => {
        if (backendServicesKeyedByName[this.backendService.name]) {
          this.useExisting = true;
        }
      });

      this.isNameDefined = (healthCheck) => angular.isDefined(healthCheck.name);

      this.oneHealthCheckIsConfigured = () => {
        return this.backingData.healthChecks.concat(this.renderedData.healthChecks).find(this.isNameDefined);
      };
    }
  });
