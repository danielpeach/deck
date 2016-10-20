import {module} from 'angular';

class HealthCheck {
  name: string;
  port: number;
  checkIntervalSec: number = 10;
  timeoutSec: number = 5;
  healthyThreshold: number = 10;
  unhealthyThreshold: number = 2;
  healthCheckType: 'TCP';
}

class BackendService {
  name: string;
  backends: any[] = [];
  healthCheck: HealthCheck;
}

class InternalLoadBalancer {
  region: string;
  ports: string[];
  ipProtocol: string;
  loadBalancerType: string = 'INTERNAL';
  credentials: string;
  network: string = 'default';
  subnet: string;
  backendService: BackendService;
}

class InternalLoadBalancerCtrl implements ng.IComponentController {
  pages: { [k:string]: string } = {
    'location': require('./createLoadBalancerProperties.html'),
    'listeners': require('./listeners.html'),
    'healthCheck': require('../healthCheck.html'),
    'advancedSettings': require('../advancedSettings.html'),
  };

  static get $inject () {
    return ['loadBalancer'];
  }

  $onInit (): void {

  }
}

const gceInternalLoadBalancerCtrl = 'spinnaker.gce.internalLoadBalancer.controller';

module(gceInternalLoadBalancerCtrl, [])
  .controller('gceInternalLoadBalancerCtrl', InternalLoadBalancerCtrl);

export default gceInternalLoadBalancerCtrl;
