export class HttpLoadBalancerTemplate {
  provider: string = 'gce';
  stack: string = '';
  detail: string = '';
  region: string = 'global';
  loadBalancerType: string = 'HTTP';
  certificate: string = '';
  defaultService: BackendServiceTemplate;
  hostRules: HostRuleTemplate[] = [];
  listeners: ListenerTemplate[] = [new ListenerTemplate()];

  constructor (public credentials: string | null) {}
}

export class BackendServiceTemplate {
  backends = [];
  healthCheck: HealthCheckTemplate;

  constructor(public useAsDefault: boolean = false) {}
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
  pathMatcher: PathMatcherTemplate = new PathMatcherTemplate;
}

export class PathMatcherTemplate {
  pathRules: PathRuleTemplate[] = [];
}

export class PathRuleTemplate {
  paths: string[];
}

export class ListenerTemplate {
  name: string;
  port: number;
  certificate: string | null = null;
}
