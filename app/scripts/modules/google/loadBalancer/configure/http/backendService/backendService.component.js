'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backendService.component', [
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gceBackendService', {
    bindings: {
      deleteService: '&',
      backingData: '=',
      renderedData: '=',
      aggregateData: '=',
      index: '=',
      defaultServiceManager: '&'
    },
    templateUrl: require('./backendService.component.html'),
    controller: function (_) {
      this.rendered = this.renderedData.backendServices;
      let i = this.index,
        servicesByName = this.backingData.backendServicesKeyedByName,
        healthChecksByName = this.backingData.healthChecksKeyedByName;

      this.onBackendServiceSelect = (selectedBackendService) => {
        setAsDefaultIfNecessary(selectedBackendService);
        addHealthCheckToRendered(selectedBackendService);
      };

      this.onBackendServiceNameChange = (typedServiceName) => {
        let serviceMatchingTypedName = servicesByName[typedServiceName];
        if (serviceMatchingTypedName) {
          this.editExisting = true;
          _.assign(this.rendered[i], serviceMatchingTypedName);
          setAsDefaultIfNecessary(this.rendered[i]);
          addHealthCheckToRendered(this.rendered[i]);
        }
      };

      this.toggleEditExisting = () => {
        this.editExisting = !this.editExisting;
        if (!this.editExisting) {
          _.assign(this.rendered[i], this.backendService);
          delete this.rendered[i].name;
          setAsDefaultIfNecessary(this.rendered[i]);
          addHealthCheckToRendered(this.rendered[i]);
        }
      };

      let setAsDefaultIfNecessary = (service) => {
        if (!this.rendered.find((service) => service.useAsDefault)) {
          service.useAsDefault = true;
        }
      };

      let addHealthCheckToRendered = (service) => {
        if (!this.renderedData.healthChecks.find((hc) => hc.name === service.healthCheck)) {
          this.renderedData.healthChecks.push(healthChecksByName[service.healthCheck]);
        }
      };

      if (this.backingData.backendServicesKeyedByName[this.rendered[i].name]) {
        this.editExisting = true;
      }
    }
  });
