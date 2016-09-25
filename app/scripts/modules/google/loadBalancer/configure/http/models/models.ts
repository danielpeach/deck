export class BackendService {
  backends: any[];
  useAsDefault: boolean;
}

export class HealthCheck {
  requestPath: string = '/';
  port: number = 80;
  checkIntervalSec: number = 10;
  timeoutSec: number = 5;
  healthyThreshold: number = 10;
  unhealthyThreshold: number = 2;
}

export class PathRule {
  paths: any[];
}

export class HostRule {
  hostPatterns: string[];
  pathMatcher: PathRule[];
}

export class HttpLoadBalancer {
  stack: string;
  detail: string;
  region: string = 'global';
  loadBalancerType: string = 'HTTP';
  certificate: string | null;
  defaultService: BackendService;
  hostRules: HostRule[];

  constructor (public provider: string) {}
}