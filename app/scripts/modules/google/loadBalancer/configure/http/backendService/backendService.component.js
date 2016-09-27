'use strict';

let angular = require('angular');
require('./../backendService.component.less');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backendService.component', [
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
    controller: function (_) {
      this.onBackendServiceSelect = (backendService) => {
        _.assign(this.renderedData.backendServices[this.index], backendService);

        if (!this.renderedData.backendServices.find((service) => service.useAsDefault)) {
          this.renderedData.backendServices[this.index].useAsDefault = true;
        }
      };

      this.onBackendServiceNameChange = (backendServiceName) => {
        if (this.backingData.backendServicesKeyedByName[backendServiceName]) {
          this.editExisting = true;
          _.assign(
            this.renderedData.backendServices[this.index],
            this.backingData.backendServicesKeyedByName[backendServiceName]);
        }
      };

      this.onEditExistingChange = (editExisting) => {
        if (!editExisting) {
          delete this.backendService.name;
        }
      };

      if (this.backingData.backendServicesKeyedByName[this.backendService.name]) {
        this.editExisting = true;
      }

      this.isNameDefined = (healthCheck) => angular.isDefined(healthCheck.name);

      this.oneHealthCheckIsConfigured = () => {
        return this.backingData.healthChecks.concat(this.renderedData.healthChecks).find(this.isNameDefined);
      };
    }
  });
