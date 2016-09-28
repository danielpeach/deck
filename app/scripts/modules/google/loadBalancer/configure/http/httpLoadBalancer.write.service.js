'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.write.service', [
    require('../../../../core/task/taskExecutor.js'),
    require('../../../../core/cache/infrastructureCaches.js')
  ])
  .factory('gceHttpLoadBalancerWriter', function (taskExecutor, infrastructureCaches) {
    function upsertLoadBalancers (loadBalancers, application, descriptor) {
      loadBalancers.forEach((lb) => {
        angular.extend(lb, {
          type: 'upsertLoadBalancer',
          cloudProvider: 'gce',
          loadBalancerName: lb.name
        });
      });

      infrastructureCaches.clearCache('loadBalancers');

      return taskExecutor.executeTask({
        job: loadBalancers,
        application: application,
        description: `${descriptor} Load Balancer: ${loadBalancers[0].urlMapName}`
      });
    }

    return { upsertLoadBalancers };
  });
