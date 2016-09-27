export class HttpLoadBalancerTemplate {
  provider: string = 'gce';
  stack: string = '';
  detail: string = '';
  region: string = 'global';
  loadBalancerType: string = 'HTTP';
  portRange: string = '80';
  certificate: string = '';
  defaultService: BackendServiceTemplate;
  hostRules: HostRuleTemplate[] = [];
  listeners: ListenerTemplate = new ListenerTemplate();

  constructor (public credentials: string | null) {}
}

export class BackendServiceTemplate {
  backends = [];
  useAsDefault: boolean = false;
  healthCheck: HealthCheckTemplate;
}

export class HealthCheckTemplate {
  requestPath: string = '/';
  port: number = 80;
  checkIntervalSec: number = 10;
  timeoutSec: number = 5;
  healthyThreshold: number = 10;
  unhealthyThreshold: number = 2;
}

export class HostRuleTemplate {
  hostPatterns: string[];
  pathMatcher: PathMatcherTemplate;
}

class PathMatcherTemplate {
  pathRules: PathRuleTemplate[];
}

class PathRuleTemplate {
  paths: string[];
}

export class ListenerTemplate {
  portRanges: number[] = [];
  certificate: string | null = null;
}
