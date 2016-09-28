'use strict';

let angular = require('angular');
import {BackendServiceTemplate} from '../templates.ts';

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backendService.component', [
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gceBackendService', {
    bindings: {
      deleteService: '&',
      backendService: '=',
      command: '=',
      index: '=',
      defaultServiceManager: '&'
    },
    templateUrl: require('./backendService.component.html'),
    controller: function (_) {
      this.backingData = this.command.backingData;
      let loadBalancer = this.command.loadBalancer;
      let servicesByName = this.backingData.backendServicesKeyedByName;

      this.onBackendServiceSelect = (selectedBackendService) => {
        assign(selectedBackendService);
        setAsDefaultIfNecessary(selectedBackendService);
      };

      this.onBackendServiceNameChange = (typedName) => {
        let matchingService = servicesByName[typedName];
        if (matchingService) {
          this.editExisting = true;
          assign(matchingService);
          setAsDefaultIfNecessary(matchingService);
        }
      };

      this.toggleEditExisting = () => {
        this.editExisting = !this.editExisting;
        if (!this.editExisting) {
          let template = new BackendServiceTemplate()
          assign(template);
          setAsDefaultIfNecessary(template);
        }
      };

      this.getAllHealthChecks = () => {
        let healthCheckNames = loadBalancer.healthChecks.map((hc) => hc.name);
        if (this.backendService.healthCheck) {
          healthCheckNames = healthCheckNames.concat([this.backendService.healthCheck]);
        }
        return _.uniq(healthCheckNames);
      };

      this.warn = () => this.originalService && !_.isEqual(this.originalService, this.backendService);


      let setAsDefaultIfNecessary = (service) => {
        if (!loadBalancer.backendServices.find((service) => service.useAsDefault)) {
          service.useAsDefault = true;
        }
      };

      if (servicesByName[this.backendService.name]) {
        this.editExisting = true;
      }

      let assign = (toAssign) => {
        this.originalService = _.cloneDeep(toAssign);
        loadBalancer.backendServices[this.index] = this.backendService = toAssign;
      };
    }
  });
