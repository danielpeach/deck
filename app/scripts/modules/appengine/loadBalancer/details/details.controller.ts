import {module} from 'angular';
import {cloneDeep} from 'lodash';

import {Application} from 'core/application/application.model';
import {LoadBalancer} from 'core/domain/index';

interface ILoadBalancerFromStateParams {
  accountId: string;
  region: string;
  name: string;
}

class AppengineLoadBalancerDetailsController {
  public state = { loading: true };
  public loadBalancer: LoadBalancer;

  static get $inject() { return ['$uibModal', '$state', '$scope', 'loadBalancer', 'app', 'loadBalancerWriter', 'confirmationModalService']; }

  constructor(private $uibModal: any,
              private $state: any,
              private $scope: any,
              private loadBalancerFromParams: ILoadBalancerFromStateParams,
              private app: Application,
              private loadBalancerWriter: any,
              private confirmationModalService: any) {
    this.app.getDataSource('loadBalancers')
      .ready()
      .then(() => this.extractLoadBalancer());
  }

  public editLoadBalancer(): void {
    this.$uibModal.open({
      templateUrl: require('../configure/wizard/wizard.html'),
      controller: 'appengineLoadBalancerWizardCtrl as ctrl',
      size: 'lg',
      resolve: {
        application: () => this.app,
        loadBalancer: () => cloneDeep(this.loadBalancer),
        isNew: () => false,
        forPipelineConfig: () => false,
      }
    });
  }

  public deleteLoadBalancer(): void {
    let taskMonitor = {
      application: this.app,
      title: 'Deleting ' + this.loadBalancer.name,
      forceRefreshMessage: 'Refreshing application...',
      forceRefreshEnabled: true
    };

    let submitMethod = () => {
      this.loadBalancer.providerType = this.loadBalancer.provider;
      this.loadBalancer.accountId = this.loadBalancer.account;
      return this.loadBalancerWriter.deleteLoadBalancer(this.loadBalancer, this.app, {
        loadBalancerName: this.loadBalancer.name,
      });
    };

    this.confirmationModalService.confirm({
      header: 'Really delete ' + this.loadBalancer.name + '?',
      buttonText: 'Delete ' + this.loadBalancer.name,
      provider: 'appengine',
      account: this.loadBalancer.account,
      applicationName: this.app.name,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
    });
  }

  private extractLoadBalancer(): void {
    this.loadBalancer = this.app.getDataSource('loadBalancers').data.find((test: LoadBalancer) => {
      return test.name === this.loadBalancerFromParams.name &&
        test.account === this.loadBalancerFromParams.accountId;
    });

    if (this.loadBalancer) {
      this.state.loading = false;
      this.app.getDataSource('loadBalancers').onRefresh(this.$scope, () => this.extractLoadBalancer());
    } else {
      this.autoClose();
    }
  }

  private autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    } else {
      this.$state.params.allowModalToStayOpen = true;
      this.$state.go('^', null, {location: 'replace'});
    }
  }
}

export const APPENGINE_LOAD_BALANCER_DETAILS_CTRL = 'spinnaker.appengine.loadBalancerDetails.controller';

module(APPENGINE_LOAD_BALANCER_DETAILS_CTRL, [
  require('core/loadBalancer/loadBalancer.write.service.js'),
]).controller('appengineLoadBalancerDetailsCtrl', AppengineLoadBalancerDetailsController);
