import {module} from 'angular';
import * as _ from 'lodash';
import {ICredentials} from 'core/domain/ICredentials'
import {Application} from 'core/application/application.model'
import {IGoogleSubnet} from '../../../domain';

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
  stack: string;
  detail: string;
  loadBalancerName: string;
  ports: string[];
  ipProtocol: string;
  loadBalancerType: string = 'INTERNAL';
  credentials: string;
  network: string = 'default';
  subnet: string;
  backendService: BackendService;

  constructor (public region?: string) {}
}

interface loadBalancerNameMap {
  [k: string]: { [k: string] : string[] };
}

class InternalLoadBalancerCtrl implements ng.IComponentController {
  pages: { [k:string]: string } = {
    'location': require('./createLoadBalancerProperties.html'),
    'listeners': require('./listeners.html'),
    'healthCheck': require('../network/healthCheck.html'),
    'advancedSettings': require('../network/advancedSettings.html'),
  };
  accounts: ICredentials[];
  regions: string[];
  subnets: IGoogleSubnet[];
  loadBalancerNameMap: loadBalancerNameMap;
  existingLoadBalancerNames: string[];

  static get $inject () {
    return ['$q',
            'application',
            'loadBalancer',
            'isNew',
            '$uibModalInstance',
            'accountService',
            'settings',
            'subnetReader',
            'loadBalancerReader'];
  }

  constructor (public $q: ng.IQService,
               public application: Application,
               public loadBalancer: InternalLoadBalancer,
               public isNew: boolean,
               public $uibModalInstance: any,
               public accountService: any,
               public settings: any,
               public subnetReader: any,
               public loadBalancerReader: any) { }

  $onInit (): void {
    if (this.isNew) {
      this.initializeCreateMode()
    }
  }

  initializeCreateMode (): void {
    this.loadBalancer = new InternalLoadBalancer(this.settings.providers.gce
                                                 ? this.settings.providers.gce.defaults.region
                                                 : null);

    let loadBalancerNamePromise = this.loadBalancerReader.listLoadBalancers('gce')
      .then((loadBalancers) => {
        return _.chain(loadBalancers)
          .map('accounts')
          .flatten()
          .groupBy('name') // account name
          .mapValues((accounts) => {
            return _.chain(accounts)
              .map('regions')
              .flatten()
              .map('loadBalancers')
              .flatten()
              .groupBy('region')
              .mapValues((loadBalancers) => _.map(loadBalancers, 'name'))
              .value();
          })
          .value();
      });

    this.$q.all({
      accounts: this.accountService.listAccounts('gce'),
      subnets: this.subnetReader.listSubnetsByProvider('gce'),
      loadBalancerNames: loadBalancerNamePromise,
    }).then(({ accounts,
               subnets,
               loadBalancerNames } : { accounts: ICredentials[],
                                       subnets: IGoogleSubnet[],
                                       loadBalancerNames: loadBalancerNameMap }) => {
      let accountNames: string[] = accounts.map((a) => a.name);

      if (accountNames.length && !accountNames.includes(this.loadBalancer.credentials)) {
        this.loadBalancer.credentials = accountNames[0];
      }
      this.accountUpdated();

      this.accounts = accounts;
      this.subnets = subnets;
      this.loadBalancerNameMap = loadBalancerNames;
      this.loadBalancer.loadBalancerName = this.getName();
    });
  }

  accountUpdated (): void {
    this.accountService.getRegionsForAccount(this.loadBalancer.credentials)
      .then((regions: { name: string }[]) => {
        this.regions = regions.map((r) => r.name);
        this.regionUpdated();
        this.existingLoadBalancerNames = this.loadBalancerNameMap[this.loadBalancer.credentials][this.loadBalancer.region];
      });
  }

  regionUpdated (): void {
    let lbRegion: string = this.loadBalancer.region;
    let subnet: IGoogleSubnet = this.subnets.find((s) => s.region === lbRegion);
    if (subnet) {
      this.loadBalancer.subnet = subnet.name;
    }

    this.existingLoadBalancerNames = this.loadBalancerNameMap[this.loadBalancer.credentials][lbRegion];
  }

  getName (): string {
    let lb = this.loadBalancer;
    let loadBalancerName = [this.application.name, (lb.stack || ''), (lb.detail || '')].join('-');
    return _.trimEnd(loadBalancerName, '-');
  }

  updateName (): void {
    this.loadBalancer.loadBalancerName = this.getName();
  }
}

const gceInternalLoadBalancerCtrl = 'spinnaker.gce.internalLoadBalancer.controller';

module(gceInternalLoadBalancerCtrl, [
    require('core/subnet/subnet.read.service.js')
  ])
  .controller('gceInternalLoadBalancerCtrl', InternalLoadBalancerCtrl);

export default gceInternalLoadBalancerCtrl;

/*
  need
    1). app-stack-detail name (for load balancer and backend service). (need to dedupe)
    2). region
    3). account
    4). Network and subnetwork.
    5). protocol and ports (listener)

    6). Health check (required)
    7). session affinity (NONE,
                          CLIENT_IP,
                          CLIENT_IP_PORT_PROTO,
                          CLIENT_IP_PROTO)
 */
