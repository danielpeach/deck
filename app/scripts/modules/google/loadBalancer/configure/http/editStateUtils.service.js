'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.editStateUtils.service', [
    require('../../../../core/utils/lodash.js')
  ])
  .factory('gceHttpLoadBalancerEditStateUtils', function (_) {

    function getRenderedData (lb) {
      let backendServices = getBackendServices(lb);
      let healthChecks = getHealthChecks(backendServices);
      let hostRules = getHostRules(lb);
      let certificate = lb.certificate;

      normalizeLoadBalancer(lb);

      return { backendServices, healthChecks, hostRules };
    }

    function getBackendServices (lb) {
      let backendServices = [getAndMarkDefaultBackend(lb)];

      if (lb.hostRules) {
        backendServices = _.uniq(
          lb.hostRules
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

    function getAndMarkDefaultBackend (lb) {
      let s = lb.defaultService;
      s.useAsDefault = true;
      return s;
    }

    function getHealthChecks (services) {
      return _(services)
        .map((s) => s.healthCheck)
        .uniq('name')
        .valueOf();
    }

    function getHostRules (lb) {
      return lb.hostRules;
    }

    function mapBackendServicesToNames (lb) {
      /*
       places to spot a backend service:
       1). loadBalancer.defaultService
       2). hostRule.pathMatcher.defaultService
       3). pathRule.backendService
       */

      lb.defaultService = lb.defaultService.name;

      lb.hostRules.forEach((hostRule) => {
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

    function normalizeLoadBalancer (lb) {
      mapBackendServicesToNames(lb);
      delete lb.instances;
    }

    return { getRenderedData };

  });
