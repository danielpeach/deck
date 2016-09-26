'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backingData.service', [
    require('../../../backendService/backendService.reader.js'),
    require('../../../httpHealthCheck/httpHealthCheck.reader.js'),
  ])
  .factory('gceHttpLoadBalancerBackingData', function ($q, gceBackendServiceReader, gceHttpHealthCheckReader) {

    let callbacks = [];

    function getBackingData () {
      let backendServices = gceBackendServiceReader.listBackendServices()
        .then(([response]) => response.results);

      let httpHealthChecks = gceHttpHealthCheckReader.listHttpHealthChecks()
        .then(([response]) => response.results.map((hc) => JSON.parse(hc.httpHealthCheck)));

      return $q.all({ backendServices, httpHealthChecks })
        .then(({ backendServices, httpHealthChecks }) => {
          let healthChecksKeyedBySelfLink = keyByProperty(httpHealthChecks, 'selfLink');

          backendServices.forEach((service) => {
            service.healthCheck = healthChecksKeyedBySelfLink[service.healthCheckLink];
          });

          let data = {
            backendServices,
            healthChecks: httpHealthChecks,
            backendServicesKeyedByName: keyByProperty(backendServices, 'name'),
            healthChecksKeyedByName: keyByProperty(httpHealthChecks, 'name'),
          };

          callbacks.forEach((cb) => cb(data));
          callbacks = [];

          return $q.all(data);
        });
    }

    function keyByProperty (list, prop) {
      return list.reduce((map, element) => {
        map[element[prop]] = element;
        return map;
      }, {});
    }

    function onLoad (cb) {
      callbacks.push(cb);
    }

    return { getBackingData, onLoad };
  });
