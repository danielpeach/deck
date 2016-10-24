import {IGoogleHealthCheck} from './healthCheck';
import {GoogleSessionAffinity} from './sessionAffinity';

export interface IGoogleBackendService {
  name: string;
  backends: any[];
  healthCheck: IGoogleHealthCheck;
  sessionAffinity: GoogleSessionAffinity; 
}