'use strict';

import {HealthCheckTemplate, HttpLoadBalancerTemplate, BackendServiceTemplate} from './templates.ts';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.backing.service', [
    require('../../../backendService/backendService.reader.js'),
    require('../../../../core/utils/lodash.js'),
    require('../../elSevenUtils.service.js'),
    require('../../../httpHealthCheck/httpHealthCheck.reader.js'),
    require('../../../certificate/certificate.reader.js'),
    require('./editStateUtils.service.js'),
    require('../../../../core/account/account.service.js'),
    require('../../../../core/loadBalancer/loadBalancer.read.service.js')
  ])
  .factory('gceHttpLoadBalancerCommandBuilder', function ($q, _, accountService,
                                                          elSevenUtils,
                                                          gceBackendServiceReader,
                                                          gceCertificateReader,
                                                          gceHttpHealthCheckReader,
                                                          gceHttpLoadBalancerEditStateUtils,
                                                          loadBalancerReader, settings) {

    /*
      - Map objects to name string identifiers (to avoid object reference issues).
    */

    function mapHealthCheckNamesToBackendServices (healthChecks, backendServices) {
      let healthChecksKeyedBySelfLink = keyByProperty(healthChecks, 'selfLink');

      backendServices.forEach((service) => {
        service.healthCheck = healthChecksKeyedBySelfLink[service.healthCheckLink].name;
      });
    }

    function buildBackingData ({
      healthChecks, backendServices, certificates, accounts, globalLoadBalancersKeyedByAccount }) {

      mapHealthCheckNamesToBackendServices(healthChecks, backendServices);

      let backendServicesKeyedByName = keyByProperty(backendServices, 'name');
      let backendServicesKeyedByNameCopy = _.cloneDeep(backendServicesKeyedByName);

      let healthChecksKeyedByName = keyByProperty(healthChecks, 'name');
      let healthChecksKeyedByNameCopy = _.cloneDeep(healthChecksKeyedByName);

      return {
        backendServices,
        healthChecks,
        certificates,
        accounts,
        globalLoadBalancersKeyedByAccount,
        backendServicesKeyedByName,
        backendServicesKeyedByNameCopy,
        healthChecksKeyedByName,
        healthChecksKeyedByNameCopy,
      };
    }

    function buildLoadBalancerData (isNew, loadBalancer, backingData) {
      let loadBalancerTemplate =
        new HttpLoadBalancerTemplate(_.get(settings, 'providers.gce.defaults.account') || null);

      let mixinData = isNew
        ? { backendServices: [new BackendServiceTemplate(true)],
            healthChecks: [new HealthCheckTemplate()], }
        : gceHttpLoadBalancerEditStateUtils.getRenderedData(loadBalancer);

      let loadBalancerData = _.assign(loadBalancerTemplate, mixinData);

      setAccount(backingData.accounts, loadBalancerData);

      return loadBalancerData;
    }

    function setAccount (accounts, loadBalancerData) {
      let accountNames = _.pluck(accounts, 'name');
      let credentials = _.get(loadBalancerData, 'credentials.name') || loadBalancerData.credentials;

      if (!accountNames.includes(credentials)) {
        loadBalancerData.credentials = _.first(accountNames);
      }
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

    function getAccounts () {
      return accountService
        .listAccounts('gce');
    }

    function getLoadBalancerMap () {
      return loadBalancerReader
        .listLoadBalancers('gce')
        .then((lbs) => {
          return _(lbs)
            .map(lb => lb.accounts)
            .flatten()
            .groupBy('name')
            .mapValues((accounts) => {
              return _(accounts)
                .map(a => a.regions)
                .flatten()
                .filter(region => region.name === elSevenUtils.getElSevenRegion())
                .map(region => region.loadBalancers)
                .flatten()
                .map(lb => lb.name)
                .uniq()
                .valueOf();
            })
            .valueOf();
        });
    }

    function buildCommand ({ isNew, loadBalancer }) {
      return $q.all({
        backendServices: getBackendServices(),
        healthChecks: getHealthChecks(),
        certificates: getCertificates(),
        globalLoadBalancersKeyedByAccount: getLoadBalancerMap(),
        accounts: getAccounts(),
      })
        .then(({ backendServices, healthChecks, certificates, accounts, globalLoadBalancersKeyedByAccount }) => {

          let backingData = buildBackingData({
            healthChecks,
            backendServices,
            certificates,
            accounts,
            globalLoadBalancersKeyedByAccount
          });

          let loadBalancer = buildLoadBalancerData(isNew, loadBalancer, backingData);

          return {
            backingData,
            loadBalancer,
            onHealthCheckRefresh,
            onCertificateRefresh,
            onBackendServiceRefresh,
            defaultServiceManager
          };
        });
    }

    function onHealthCheckRefresh (command) {
      getHealthChecks()
        .then((healthChecks) => {
          command.backingData.healthChecks = healthChecks;
        });
    }

    function onCertificateRefresh (command) {
      getCertificates()
        .then((certificates) => {
          command.backingData.certificates = certificates;
        });
    }

    function onBackendServiceRefresh (command) {
      getBackendServices()
        .then((backendServices) => {
          mapHealthCheckNamesToBackendServices(command.backingData.healthChecks, backendServices);
          command.backingData.backendServices = backendServices;
        });
    }

    function defaultServiceManager (command, clickedService) {
      // The checkbox operates more like a radio button: exactly one needs to be checked.
      if (clickedService.useAsDefault) {
        command.loadBalancer.backendServices
          .filter(service => service !== clickedService)
          .forEach(service => service.useAsDefault = false);
      } else {
        clickedService.useAsDefault = true;
      }
    }

    function keyByProperty (list, prop) {
      return list.reduce((map, element) => {
        map[element[prop]] = element;
        return map;
      }, {});
    }

    return { buildCommand };
  });
