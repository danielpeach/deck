'use strict';

import {HealthCheckTemplate, ListenerTemplate, BackendServiceTemplate} from './templates.ts';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backing.service', [
    require('../../../backendService/backendService.reader.js'),
    require('../../../../core/utils/lodash.js'),
    require('../../../httpHealthCheck/httpHealthCheck.reader.js'),
    require('../../../certificate/certificate.reader.js'),
    require('./templateGenerator.service.js'),
    require('./editStateUtils.service.js'),
  ])
  .factory('gceHttpDeserializeService', function ($q, _, gceBackendServiceReader,
                                                  gceCertificateReader,
                                                  gceHttpHealthCheckReader,
                                                  gceHttpLoadBalancerEditStateUtils) {

    /*
      Goals of deserialization:
        - Group data into three categories:
           - backing data (i.e., available but not necessarily used resources pulled from API)
           - rendered data (i.e., data that is actively being shown to the user)
           - aggregated data (i.e., union of backing and rendered to be shown in dropdowns)
        - Map objects to name string identifiers (to avoid object reference issues).
        - Manage issues arising from the grouping of listeners on the front end.
    */

    // Backend services' health check -> health check name

    function mapHealthCheckNamesToBackendServices (healthChecks, backendServices) {
      let healthChecksKeyedBySelfLink = keyByProperty(healthChecks, 'selfLink');

      backendServices.forEach((service) => {
        service.healthCheck = healthChecksKeyedBySelfLink[service.healthCheckLink].name;
      });
    }

    function buildBackingData (healthChecks, backendServices, certificates) {
      return {
        backendServices,
        healthChecks,
        certificates,
        backendServicesKeyedByName: keyByProperty(backendServices, 'name'),
        healthChecksKeyedByName: keyByProperty(healthChecks, 'name'),
      };
    }

    function buildRenderedData (isNew, loadBalancer) {
      return isNew
        ? { backendServices: [
          (function () {
            let template = new BackendServiceTemplate();
            template.useAsDefault = true;
            return template;
          })()],
          healthChecks: [new HealthCheckTemplate()],
          hostRules: [],
          listeners: [new ListenerTemplate()]}
        : gceHttpLoadBalancerEditStateUtils.getRenderedData(loadBalancer);
    }

    function buildAggregateData (backing, rendered) {
      return Object.defineProperties({}, {
        backendServices: {
          get: () => _.uniq(backing.backendServices.concat(rendered.backendServices).map(service => service.name)),
        },
        healthChecks: {
          get: () => _.uniq(backing.healthChecks.concat(rendered.healthChecks).map(hc => hc.name)),
        },
        certificates: {
          get: rendered.certificate
            ? () => _.uniq(backing.certificates, rendered.certificate)
            : () => backing.certificates,
        }
      });
    }

    function getHealthChecks () {
      return gceHttpHealthCheckReader.listHttpHealthChecks()
        .then(([response]) => response.results.map((hc) => JSON.parse(hc.httpHealthCheck)));
    }

    function getBackendServices () {
      return gceBackendServiceReader.listBackendServices()
        .then(([response]) => response.results);
    }

    function getCertificates () {
      return gceCertificateReader.listCertificates()
        .then(([response]) => response.results.map(c => c.name));
    }

    function getData ({ isNew, loadBalancer }) {
      return $q.all({
        backendServices: getBackendServices(),
        httpHealthChecks: getHealthChecks(),
        certificates: getCertificates(),
      })
        .then(({ backendServices, httpHealthChecks, certificates }) => {
          mapHealthCheckNamesToBackendServices(httpHealthChecks, backendServices);

          let backingData = buildBackingData(httpHealthChecks, backendServices, certificates);
          let renderedData = buildRenderedData(isNew, loadBalancer);

          return {
            backingData,
            renderedData,
            aggregateData: buildAggregateData(backingData, renderedData),
          };
        });
    }

    function keyByProperty (list, prop) {
      return list.reduce((map, element) => {
        map[element[prop]] = element;
        return map;
      }, {});
    }

    return {
      getCertificates,
      getData,
      getHealthChecks,
      getBackendServices,
      mapHealthCheckNamesToBackendServices, };
  });
