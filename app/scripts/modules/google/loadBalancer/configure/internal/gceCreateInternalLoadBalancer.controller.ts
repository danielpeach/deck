import {module} from 'angular';

class internalLoadBalancerCtrl implements ng.IComponentController {

}

const gceInternalLoadBalancerCtrl = 'spinnaker.gce.internalLoadBalancer.controller';

module(gceInternalLoadBalancerCtrl, [])
  .controller('gceInternalLoadBalancerCtrl', internalLoadBalancerCtrl);

export default gceInternalLoadBalancerCtrl;
