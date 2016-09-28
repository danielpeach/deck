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
      let servicesByNameCopy = this.backingData.backendServicesKeyedByNameCopy;

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
          let template = new BackendServiceTemplate();
          assign(template);
          setAsDefaultIfNecessary(template);
        }
      };

      this.getAllHealthChecks = () => {
        let allHealthChecks = loadBalancer.healthChecks.concat(this.backingData.healthChecks);
        return _.uniq(allHealthChecks.map((hc) => hc.name));
      };

      let getPlain = (service) => {
        let copy = _.cloneDeep(service);
        return {
          account: copy.account,
          healthCheck: copy.healthCheck,
          healthCheckLink: copy.healthCheckLink,
          name: copy.name,
          provider: copy.provider,
          type: copy.type,
        };
      };

      this.showModifiedWarning = () => {
        let originalService = servicesByNameCopy[this.backendService.name];
        return originalService && !_.isEqual(getPlain(this.backendService), originalService);
      };

      this.revert = () => {
        let originalService = _.cloneDeep(servicesByNameCopy[this.backendService.name]);
        assign(originalService);
        setAsDefaultIfNecessary(originalService);
      };


      let setAsDefaultIfNecessary = (service) => {
        if (!loadBalancer.backendServices.find((service) => service.useAsDefault)) {
          service.useAsDefault = true;
        }
      };

      if (servicesByName[this.backendService.name]) {
        this.editExisting = true;
      }

      let assign = (toAssign) => {
        loadBalancer.backendServices[this.index] = this.backendService = toAssign;
      };
    }
  });
