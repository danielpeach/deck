'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backingData.service', [
    require('../../../backendService/backendService.reader.js'),
    require('../../../httpHealthCheck/httpHealthCheck.reader.js'),
    require('./templateGenerator.service.js'),
    require('./editStateUtils.service.js'),
  ])
  .factory('gceHttpLoadBalancerCommandBuilder', function ($q, gceBackendServiceReader, 
                                                          gceHttpHealthCheckReader,
                                                          gceHttpLoadBalancerEditStateUtils,
                                                          gceHttpLoadBalancerTemplateGenerator) {
    let {
      backendServiceTemplate,
      healthCheckTemplate, } = gceHttpLoadBalancerTemplateGenerator;

    function getData ({ isNew, loadBalancer }) {
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

          let backingData = {
            backendServices,
            healthChecks: httpHealthChecks,
            backendServicesKeyedByName: keyByProperty(backendServices, 'name'),
            healthChecksKeyedByName: keyByProperty(httpHealthChecks, 'name'),
          };

          let renderedData = isNew 
            ? { backendServices: [
                (function () {
                  let template = backendServiceTemplate();
                  template.useAsDefault = true;
                  return template;
                })()],
              healthChecks: [healthCheckTemplate()],
              hostRules: [], }
            : gceHttpLoadBalancerEditStateUtils.getRenderedData(loadBalancer);

           let aggregateData = {};

          Object.defineProperties(aggregateData, {
            backendServices: {
              get: () => {
                return _.uniq(
                  backingData.backendServices.concat(renderedData.backendServices),
                  (service) => service.name);
              }
            },
            healthChecks: {
              get: () => {
                return _.uniq(
                  backingData.healthChecks.concat(renderedData.healthChecks),
                  (service) => service.name);
              }
            }
          });

          return $q.all({ backingData, renderedData, aggregateData });
        });
    }

    function keyByProperty (list, prop) {
      return list.reduce((map, element) => {
        map[element[prop]] = element;
        return map;
      }, {});
    }

    return { getData };
  });
