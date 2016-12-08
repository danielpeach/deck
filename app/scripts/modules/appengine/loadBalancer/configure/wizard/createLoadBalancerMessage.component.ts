class AppengineLoadBalancerCreateMessageComponent implements ng.IComponentOptions {
  public templateUrl: string = require('./createLoadBalancerMessage.component.html');
}

export const APPENGINE_LOAD_BALANCER_CREATE_MESSAGE = 'spinnaker.appengine.loadBalancer.createMessage.component';

angular.module(APPENGINE_LOAD_BALANCER_CREATE_MESSAGE, [])
  .component('appengineLoadBalancerCreateMessage', new AppengineLoadBalancerCreateMessageComponent());
