'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.gce.deck.httpLoadBalancer.transformer', [])
  .factory('gceHttpLoadBalancerTransformer', function () {

    function serialize ({ backingData, loadBalancer }) {
      /*
      * Two goals here:
      *   - map component names to full component objects
      *   - separate into separate load balancer commands by listener
      * */
      



    }

    return { serialize };
  });
