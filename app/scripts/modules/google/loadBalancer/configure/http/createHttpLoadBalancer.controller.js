'use strict';

import {HealthCheckTemplate, BackendServiceTemplate, HostRuleTemplate, ListenerTemplate} from './templates.ts';
let angular = require('angular');
require('./httpLoadBalancerWizard.component.less');

module.exports = angular.module('spinnaker.deck.gce.loadBalancer.createHttp.controller', [
  require('angular-ui-bootstrap'),
  require('angular-ui-router'),
  require('../../../../core/utils/lodash.js'),
  require('./backendService/backendService.component.js'),
  require('./healthCheck/healthCheck.component.js'),
  require('./basicSettings/basicSettings.component.js'),
  require('./hostRule/hostRule.component.js'),
  require('../../../../core/task/monitor/taskMonitorService.js'),
  require('./httpLoadBalancer.write.service.js'),
  require('../../../../core/modal/wizard/wizardSubFormValidation.service.js'),
  require('./editStateUtils.service.js'),
  require('../../../../core/modal/wizard/v2modalWizard.service.js'),
  require('../../elSevenUtils.service.js'),
  require('./commandBuilder.service.js'),
  require('../../../cache/cacheRefresh.component.js'),
  require('./listeners/listener.component.js'),
  require('./transformer/transformer.service.js'),
])
  .controller('gceCreateHttpLoadBalancerCtrl', function (_, $scope, settings, $uibModalInstance, application, taskMonitorService,
                                                         loadBalancer, isNew, loadBalancerWriter, taskExecutor,
                                                         gceHttpLoadBalancerWriter, $state, wizardSubFormValidation,
                                                         gceHttpLoadBalancerCommandBuilder, gceHttpLoadBalancerTransformer) {
    let keyToTemplateMap = {
      'backendServices': BackendServiceTemplate,
      'healthChecks': HealthCheckTemplate,
      'hostRules': HostRuleTemplate,
      'listeners': ListenerTemplate,
    };

    this.application = application;
    this.isNew = isNew;
    this.modalDescriptor = this.isNew
      ? 'Create HTTP(S) load balancer'
      : `Edit ${loadBalancer.name}:global:${loadBalancer.account}`;

    this.pages = {
      'location': require('./basicSettings/basicSettings.html'),
      'listeners': require('./listeners/listeners.html'),
      'backendServices': require('./backendService/backendServices.html'),
      'healthChecks': require('./healthCheck/healthChecks.html'),
      'hostRules': require('./hostRule/hostRules.html'),
    };

    this.add = (key) => {
      this.command.loadBalancer[key].push(new keyToTemplateMap[key]());

      if (key === 'backendServices' && !this.command.loadBalancer.backendServices.find((s) => s.useAsDefault)) {
        this.command.loadBalancer[key][0].useAsDefault = true;
      }
    };

    this.remove = (key, index) => {
      let [removed] = this.command.loadBalancer[key].splice(index, 1);

      if (removed.useAsDefault && this.command.loadBalancer[key][0]) {
        this.command.loadBalancer[key][0].useAsDefault = true;
      }
    };

    let onApplicationRefresh = () => {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      $uibModalInstance.close();

      let lb = this.command.loadBalancer;
      let newStateParams = {
        name: lb.name,
        accountId: lb.credentials,
        region: lb.region,
        provider: 'gce',
      };

      if (!$state.includes('**.loadBalancerDetails')) {
        $state.go('.loadBalancerDetails', newStateParams);
      } else {
        $state.go('^.loadBalancerDetails', newStateParams);
      }
    };

    let onTaskComplete = () => {
      application.loadBalancers.refresh();
      application.loadBalancers.onNextRefresh($scope, onApplicationRefresh);
    };

    $scope.taskMonitor = this.taskMonitor = taskMonitorService.buildTaskMonitor({
      application: this.application,
      title: (this.isNew ? 'Creating ' : 'Updating ') + 'your load balancer',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    this.submit = () => {
      let serializedCommands = gceHttpLoadBalancerTransformer.serialize(this.command);
      debugger;
      let descriptor = this.isNew ? 'Create' : 'Update';

      this.taskMonitor.submit(() => gceHttpLoadBalancerWriter.upsertLoadBalancers(serializedCommands, application, descriptor));
    };

    gceHttpLoadBalancerCommandBuilder.buildCommand({ isNew, loadBalancer })
      .then((command) => {
        this.command = command;

        wizardSubFormValidation
          .config({scope: $scope, form: 'form'})
          .register({page: 'location', subForm: 'location'})
          .register({page: 'listeners', subForm: 'listeners'})
          .register({
            page: 'health-checks',
            subForm: 'healthChecks',
            validators: [
              {
                watchString: 'ctrl.command.backingData.healthChecks',
                validator: (healthChecks) => healthChecks.length > 0,
                collection: true
              }
            ]
          })
          .register({
            page: 'backend-services',
            subForm: 'backendServices',
            validators: [
              {
                watchString: 'ctrl.command.loadBalancer.backendServices',
                validator: (services) => services.find((service) => service.useAsDefault),
                collection: true
              }
            ]
          })
          .register({page: 'host-rules', subForm: 'hostRules'});
      });

    this.cancel = $uibModalInstance.dismiss;
  });
