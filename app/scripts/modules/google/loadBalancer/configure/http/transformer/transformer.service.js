'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.gce.deck.httpLoadBalancer.transformer', [
    require('../../../../../core/utils/lodash.js'),
  ])
  .factory('gceHttpLoadBalancerTransformer', function (_) {

    // SERIALIZE

    const keysToOmit = ['backendServices', 'healthChecks', 'listeners', 'stack', 'detail'];

    function serialize (originalCommand) {
      let command = _.cloneDeep(originalCommand);
      let { loadBalancer, backingData } = command;

      backingData.backendServices = _.uniq(backingData.backendServices.concat(loadBalancer.backendServices), 'name');
      backingData.backendServicesKeyedByName = keyByProperty(backingData.backendServices, 'name');

      backingData.healthChecks = _.uniq(backingData.healthChecks.concat(loadBalancer.healthChecks), 'name');
      backingData.healthChecksKeyedByName = keyByProperty(backingData.healthChecks, 'name');

      /*
      * Main goals here:
      *   - map component names to full component objects
      *   - separate into load balancer commands by listener
      * */

      mapComponentNamesToObjects(loadBalancer, backingData);
      return buildCommandForEachListener(loadBalancer);
    }

    function mapComponentNamesToObjects (loadBalancer, backingData) {

      let { backendServices,
            backendServicesKeyedByName,
            healthChecks,
            healthChecksKeyedByName } = backingData;

      mapHealthCheckNamesToObjects(backendServices, healthChecksKeyedByName);
      loadBalancer.defaultService = backendServices.find((service) => service.useAsDefault);
      mapBackendServiceNamesToObjects(loadBalancer.hostRules, backendServicesKeyedByName);
    }

    function mapHealthCheckNamesToObjects (backendServices, healthChecksByName) {
      backendServices.forEach((service) => {
        service.healthCheck = healthChecksByName[service.healthCheck];
      });
    }

    function mapBackendServiceNamesToObjects (hostRules, backendServicesKeyedByName) {
      hostRules.forEach((hostRule) => {
        let p = hostRule.pathMatcher;

        p.defaultService = backendServicesKeyedByName[p.defaultService];

        p.pathRules.forEach((pathRule) => {
          pathRule.backendService = backendServicesKeyedByName[pathRule.backendService];
        });
      });
    }

    function buildCommandForEachListener (loadBalancer) {

      return loadBalancer.listeners.map((listener) => {
        let command = _.cloneDeep(loadBalancer);
        command = _.omit(command, keysToOmit);
        command.name = listener.name;
        command.portRange = listener.port;
        command.certificate = listener.certificate || null; // '' is JS false.

        return command;
      });
    }

    function keyByProperty (list, prop) {
      return list.reduce((map, element) => {
        map[element[prop]] = element;
        return map;
      }, {});
    }

    // DESERIALIZE

    function deserialize (loadBalancer) {
      let backendServices = getBackendServices(loadBalancer);
      let healthChecks = getHealthChecks(backendServices);
      let hostRules = getHostRules(loadBalancer);
      let certificate = loadBalancer.certificate;

      // normalizeLoadBalancer(loadBalancer);

      return { backendServices, healthChecks, hostRules, };
    }

    function getBackendServices (loadBalancer) {
      let backendServices = [getAndMarkDefaultBackend(loadBalancer)];

      if (loadBalancer.hostRules) {
        backendServices = _.uniq(
          loadBalancer.hostRules
            .reduce((services, hostRule) => {
              services = services.concat(hostRule.pathMatcher.defaultService);
              return hostRule.pathMatcher.pathRules
                .reduce((services, pathRule) => services.concat(pathRule.backendService), services);
            }, backendServices),
          'name');
      }

      mapHealthChecksToNames(backendServices);
      return backendServices;
    }

    function getAndMarkDefaultBackend (loadBalancer) {
      let s = loadBalancer.defaultService;
      s.useAsDefault = true;
      return s;
    }

    function getHealthChecks (services) {
      return _(services)
        .map((s) => s.healthCheck)
        .uniq('name')
        .valueOf();
    }

    function getHostRules (loadBalancer) {
      return loadBalancer.hostRules;
    }

    function mapBackendServicesToNames (loadBalancer) {
      /*
       places to spot a backend service:
       1). loadBalancer.defaultService
       2). hostRule.pathMatcher.defaultService
       3). pathRule.backendService
       */

      loadBalancer.defaultService = loadBalancer.defaultService.name;

      loadBalancer.hostRules.forEach((hostRule) => {
        let p = hostRule.pathMatcher;

        p.defaultService = p.defaultService.name;

        p.pathRules.forEach((pathRule) => {
          pathRule.backendService = pathRule.backendService.name;
        });
      });
    }

    function mapHealthChecksToNames (backendServices) {
      backendServices.forEach((service) => {
        service.healthCheck = service.healthCheck.name;
      });
    }

    function normalizeLoadBalancer (loadBalancer) {
      mapBackendServicesToNames(loadBalancer);
      delete loadBalancer.instances;
    }

    return { serialize, deserialize };
  });
