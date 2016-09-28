'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.basicSettings.component', [
    require('../../../../../core/account/account.service.js'),
    require('../../../../../core/loadBalancer/loadBalancer.read.service.js'),
    require('../../../../../core/utils/lodash.js'),
    require('../../../elSevenUtils.service.js'),
  ])
  .component('gceHttpLoadBalancerBasicSettings', {
    bindings: {
      command: '=',
      application: '=',
    },
    templateUrl: require('./basicSettings.component.html'),
    controller: function ($scope, accountService, loadBalancerReader, _) {
      let c = this.command;
      this.loadBalancer = c.loadBalancer;
      this.accounts = c.backingData.accounts;
      let globalLoadBalancersKeyedByAccount = c.backingData.globalLoadBalancersKeyedByAccount;

      this.getName = (loadBalancer, applicationName) => {
        let loadBalancerName = [applicationName, (loadBalancer.stack || ''), (loadBalancer.detail || '')].join('-');
        return _.trimRight(loadBalancerName, '-');
      };

      this.updateName = (lb, appName) => {
        lb.urlMapName = this.getName(lb, appName);
      };

      this.updateExistingLoadBalancerNames = (account) => {
        this.existingLoadBalancerNames = globalLoadBalancersKeyedByAccount[account];
      };

      if (!this.loadBalancer.name) {
        this.updateName(this.loadBalancer, this.application.name);
      }

      this.updateExistingLoadBalancerNames(this.loadBalancer.credentials);
    }
  });
