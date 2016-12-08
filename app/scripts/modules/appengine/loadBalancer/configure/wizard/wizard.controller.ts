import {IStateService} from 'angular-ui-router';

import {Application} from 'core/application/application.model';
import {IAppengineLoadBalancer} from 'appengine/domain/index';
import {AppengineLoadBalancerTransformer} from 'appengine/loadBalancer/transformer';

class AppengineLoadBalancerWizardController {
  public loadBalancer: IAppengineLoadBalancer;
  public taskMonitor: any;

  static get $inject() { return [
    '$scope',
    '$state',
    '$uibModalInstance',
    'application',
    'loadBalancer',
    'isNew',
    'forPipelineConfig',
    'appengineLoadBalancerTransformer',
    'taskMonitorService',
    'loadBalancerWriter']; }

  constructor(public $scope: ng.IScope,
              private $state: IStateService,
              private $uibModalInstance: any,
              private application: Application,
              loadBalancer: IAppengineLoadBalancer,
              public isNew: boolean,
              private forPipelineConfig: boolean,
              private transformer: AppengineLoadBalancerTransformer,
              taskMonitorService: any,
              private loadBalancerWriter: any) {

    if (!this.isNew) {
      this.loadBalancer = this.transformer.convertLoadBalancerForEditing(loadBalancer);

      this.taskMonitor = taskMonitorService.buildTaskMonitor({
        application: this.application,
        title: 'Updating your load balancer',
        modalInstance: this.$uibModalInstance,
        onTaskComplete: this.onTaskComplete,
      });
    }
  }

  public submit(): void {
    let description = this.transformer.convertLoadBalancerToUpsertDescription(this.loadBalancer);

    this.taskMonitor.submit(() => {
      return this.loadBalancerWriter
        .upsertLoadBalancer(description, this.application, 'Update', {cloudProvider: 'appengine'});
    });
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  private onTaskComplete(): void {
    this.application.getDataSource('loadBalancers').refresh();
    this.application.getDataSource('loadBalancers').onNextRefresh(this.$scope, this.onApplicationRefresh);
  }

  private onApplicationRefresh(): void {
    // If the user has already closed the modal, do not navigate to the new details view
    if ((this.$scope as any).$$destroyed) { // $$destroyed is not in the ng.IScope interface
      return;
    }

    this.$uibModalInstance.close();
    let newStateParams = {
      name: this.loadBalancer.name,
      accountId: this.loadBalancer.account,
      region: this.loadBalancer.region,
      provider: 'appengine',
    };

    if (!this.$state.includes('**.loadBalancerDetails')) {
      this.$state.go('.loadBalancerDetails', newStateParams);
    } else {
      this.$state.go('^.loadBalancerDetails', newStateParams);
    }
  }
}

export const APPENGINE_LOAD_BALANCER_WIZARD_CTRL = 'spinnaker.appengine.loadBalancer.wizard.controller';

angular.module(APPENGINE_LOAD_BALANCER_WIZARD_CTRL, [
    require('core/task/monitor/taskMonitorService.js'),
    require('core/loadBalancer/loadBalancer.write.service.js'),
  ]).controller('appengineLoadBalancerWizardCtrl', AppengineLoadBalancerWizardController);
