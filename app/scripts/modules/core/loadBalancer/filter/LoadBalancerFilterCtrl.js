'use strict';

let angular = require('angular');

// controllerAs: loadBalancerFilters

module.exports = angular.module('spinnaker.core.loadBalancer.filter.controller', [
  require('./loadBalancer.filter.service.js'),
  require('./loadBalancer.filter.model.js'),
  require('../../utils/lodash.js'),
  require('../../filterModel/dependentFilter/dependentFilter.service.js')
])
  .controller('LoadBalancerFilterCtrl', function ($scope, app, _, $log, loadBalancerFilterService,
                                                  LoadBalancerFilterModel, $rootScope, dependentFilterService) {

    $scope.application = app;
    $scope.sortFilter = LoadBalancerFilterModel.sortFilter;

    var ctrl = this;

    function dependentFilterPoolBuilder (loadBalancers) {
      let fieldsOfInterest = [
        { filterField: 'account', on: 'loadBalancer', localField: 'account' },
        { filterField: 'region', on: 'loadBalancer', localField: 'region' },
        { filterField: 'availabilityZone', on: 'instance', localField: 'zone' }
      ];

      let pool = _(loadBalancers)
        .map((lb) => {
          let poolUnitTemplate = fieldsOfInterest.reduce((poolUnitTemplate, field) => {
            if (field.on === 'loadBalancer') {
              poolUnitTemplate[field.filterField] = lb[field.localField];
            }
            return poolUnitTemplate;
          }, {});

          return _(['instances', 'detachedInstances'])
            .map((instanceStatus) => lb[instanceStatus])
            .flatten()
            .map((i) => {
              let poolUnit = _.cloneDeep(poolUnitTemplate)
              return fieldsOfInterest.reduce((poolUnit, field) => {
                if (field.on === 'instance') {
                  poolUnit[field.filterField] = i[field.localField];
                }
                return poolUnit;
              }, poolUnit);
            })
            .valueOf()
            .concat(poolUnitTemplate);
        })
        .flatten()
        .valueOf();

      return pool;
    }

    this.updateLoadBalancerGroups = () => {
      let { availabilityZone, region, account } = dependentFilterService.digestDependentFilters({
        sortFilter: LoadBalancerFilterModel.sortFilter,
        dependencyOrder: ['account', 'region', 'availabilityZone'],
        pool: dependentFilterPoolBuilder(app.loadBalancers.data)
      });
      debugger;
      ctrl.accountHeadings = account;
      ctrl.regionHeadings = region;
      ctrl.availabilityZoneHeadings = availabilityZone;

      LoadBalancerFilterModel.applyParamsToUrl();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
    };

    function getHeadingsForOption(option) {
      return _.compact(_.uniq(_.pluck(app.loadBalancers.data, option))).sort();
    }

    function clearFilters() {
      loadBalancerFilterService.clearFilters();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
      ctrl.updateLoadBalancerGroups();
    }

    this.initialize = function() {
      ctrl.stackHeadings = ['(none)'].concat(getHeadingsForOption('stack'));
      ctrl.providerTypeHeadings = getHeadingsForOption('type');
      ctrl.clearFilters = clearFilters;
      ctrl.updateLoadBalancerGroups();
    };

    if (app.loadBalancers.loaded) {
      this.initialize();
    }

    app.loadBalancers.onRefresh($scope, this.initialize);

    $scope.$on('$destroy', $rootScope.$on('$locationChangeSuccess', () => {
      LoadBalancerFilterModel.activate();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
    }));
  }
);
