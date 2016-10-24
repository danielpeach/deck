export interface IGoogleHealthCheck {
  name: string;
  requestPath: string;
  port: number;
  healthCheckType: HealthCheckType;
  checkIntervalSec: number;
  timeoutSec: number;
  unhealthyThreshold: number;
  healthyThreshold: number;  
}

export enum HealthCheckType {
  HTTP,
  HTTPS,
  SSL,
  TCP,
  UDP,
}