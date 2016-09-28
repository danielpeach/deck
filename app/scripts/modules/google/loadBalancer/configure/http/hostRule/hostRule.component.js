'use strict';

let angular = require('angular');
import {PathRuleTemplate} from '../templates.ts';

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.hostRule.component', [
    require('../pathRule/pathRule.component.js'),
    require('../../../../../core/utils/lodash.js'),
  ])
  .component('gceHostRule', {
    bindings: {
      hostRule: '=',
      index: '=',
      command: '=',
      deleteHostRule: '&'
    },
    templateUrl: require('./hostRule.component.html'),
    controller: function (_) {
      this.loadBalancer = this.command.loadBalancer;
      let pathRules = this.hostRule.pathMatcher.pathRules;

      this.addPathRule = () => {
        pathRules.push(new PathRuleTemplate());
      };

      this.deletePathRule = (index) => {
        pathRules.splice(index, 1);
      };

      this.getAllBackendServices = () => {
        let allBackendServices = this.loadBalancer.backendServices.concat(this.command.backingData.backendServices);
        return _.compact(_.uniq(allBackendServices.map((service) => service.name)));
      }
    }
  });
