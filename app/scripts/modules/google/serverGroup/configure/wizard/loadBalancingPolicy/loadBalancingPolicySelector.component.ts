import {set, get} from 'lodash';
import {module} from 'angular';
import './loadBalancingPolicySelector.component.less';

class GceLoadBalancingPolicySelectorController implements ng.IComponentController {

  public maxPort: number = 65535;
  public command: any;
  [key: string]: any;

  public setModel (propertyName: string, viewValue: number): void {
    set(this, propertyName, viewValue / 100);
  };

  public setView (propertyName: string , modelValue: number): void {
    this[propertyName] = this.decimalToPercent(modelValue);
  };

  public onBalancingModeChange (mode: string): void {
    let keys: string[] = ['maxUtilization', 'maxRatePerInstance', 'maxConnectionsPerInstance'];
    let toDelete: string[] = [];
    switch (mode) {
      case 'RATE':
        toDelete = _.without(keys, 'maxRatePerInstance');
        break;
      case 'UTILIZATION':
        toDelete = _.without(keys, 'maxUtilization');
        break;
      case 'CONNECTION':
        toDelete = _.without(keys, 'maxConnectionsPerInstance');
        break;
      default:
        break;
    }

    toDelete.forEach((key) => delete this.command.loadBalancingPolicy[key]);
  }

  public getBalancingModes (): string[] {
    let balancingModes: string[] = [];
    /*
    * Four cases:
    *   - If we have only HTTP(S) load balancers, our balancing mode can be RATE or UTILIZATION.
    *   - If we have only SSL load balancers, our balancing mode can be CONNECTION or UTILIZATION.
    *   - If we have both, only UTILIZATION.
    *   - If we have only SSL load balancers and an autoscaling policy, only UTILIZATION.
    * */
    if (_.has(this, 'command.backingData.filtered.loadBalancerIndex')) {
      let index = this.command.backingData.filtered.loadBalancerIndex;
      let selected = this.command.loadBalancers;

      let hasSsl = selected.find((loadBalancer: any) => get(index[loadBalancer], 'loadBalancerType') === 'SSL');
      let hasHttp = selected.find((loadBalancer: any) => get(index[loadBalancer], 'loadBalancerType') === 'HTTP');
      let hasAutoscalingPolicy = this.command.autoscalingPolicy;

      if ((hasSsl && hasHttp) || (hasSsl && hasAutoscalingPolicy)) {
        balancingModes = ['UTILIZATION'];
      } else if (hasSsl) {
        balancingModes = ['CONNECTION', 'UTILIZATION'];
      } else {
        balancingModes = ['RATE', 'UTILIZATION'];
      }
    }

    if (!balancingModes.includes(get(this.command, 'loadBalancingPolicy.balancingMode') as string)) {
      set(this.command, 'loadBalancingPolicy.balancingMode', balancingModes[0]);
    }
    return balancingModes;
  }

  public $onDestroy (): void {
    delete this.command.loadBalancingPolicy;
  }

  private decimalToPercent (value: number): number {
    if (value === 0) {
      return 0;
    }
    return value ? Math.round(value * 100) : undefined;
  }
}

class GceLoadBalancingPolicySelectorComponent implements ng.IComponentOptions {
  public bindings: any = {
    command: '='
  };
  public controller: ng.IComponentController = GceLoadBalancingPolicySelectorController;
  public templateUrl: string = require('./loadBalancingPolicySelector.component.html');
}

const moduleName = 'spinnaker.gce.loadBalancingPolicy.selector.component';

module(moduleName, [])
  .component('gceLoadBalancingPolicySelector', new GceLoadBalancingPolicySelectorComponent());

export default moduleName;
