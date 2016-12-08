import {reduce} from 'lodash';

import {ServerGroup} from 'core/domain/index';
import {IAppengineLoadBalancer} from 'appengine/domain/index';

import './basicSettings.component.less';

class AppengineLoadBalancerSettingsController implements ng.IComponentController {
  public loadBalancer: IAppengineLoadBalancer;

  public addAllocation(): void {
    let remainingServerGroups = this.serverGroupsWithoutAllocation();
    if (remainingServerGroups.length) {
      this.loadBalancer.split.allocations[remainingServerGroups[0].name] = 0;
    }
  }

  public removeAllocation(serverGroupName: string): void {
    delete this.loadBalancer.split.allocations[serverGroupName];
  }

  public onAllocationChange(serverGroupName: string, allocation: number): void {
    this.loadBalancer.split.allocations[serverGroupName] = allocation;
  }

  public showShardByOptions(): boolean {
    return Object.keys(this.loadBalancer.split.allocations).length > 1;
  }

  public allocationIsInvalid(): boolean {
    return reduce(this.loadBalancer.split.allocations, (sum, allocation) => sum + allocation, 0) !== 100;
  }

  public showAddButton(): boolean {
    return this.serverGroupsWithoutAllocation().length > 0;
  }

  private serverGroupsWithoutAllocation(): ServerGroup[] {
    return this.loadBalancer.serverGroups
      .filter((serverGroup: ServerGroup) => !(serverGroup.name in this.loadBalancer.split.allocations));
  }
}

class AppengineLoadBalancerSettingsComponent implements ng.IComponentOptions {
  public bindings: any = { loadBalancer: '=' };
  public controller: ng.IComponentController = AppengineLoadBalancerSettingsController;
  public templateUrl: string = require('./basicSettings.component.html');
}

export const APPENGINE_LOAD_BALANCER_BASIC_SETTINGS = 'spinnaker.appengine.loadBalancerSettings.component';

angular.module(APPENGINE_LOAD_BALANCER_BASIC_SETTINGS, [])
  .component('appengineLoadBalancerSettings', new AppengineLoadBalancerSettingsComponent());
