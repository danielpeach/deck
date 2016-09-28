'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.pathRule.component', [
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gcePathRule', {
    bindings: {
      pathRule: '=',
      command: '=',
      index: '=',
      deletePathRule: '&'
    },
    templateUrl: require('./pathRule.component.html'),
    controller: function (_) {
      this.getAllBackendServices = () => {
        let allBackendServices = this.command.loadBalancer.backendServices
          .concat(this.command.backingData.backendServices);

        return _.compact(_.uniq(allBackendServices.map((service) => service.name)));
      }
    }
  });
