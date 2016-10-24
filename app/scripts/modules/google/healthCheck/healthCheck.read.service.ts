import {module} from 'angular';
import * as _ from 'lodash';
import {API_SERVICE} from 'core/api/api.service';
import {IGoogleHealthCheck} from '../domain';

export class GceHealthCheckReader {
  static get $inject () { return ['API', 'infrastructureCaches']; }

  constructor (public API: API_SERVICE, public infrastructureCaches: any) {}

  listHealthChecks (type?: string): ng.IPromise<IGoogleHealthCheck[]> {
    if (type) {
      return this.listHealthChecks()
        .then((healthCheckWrappers: any[]) => {
          return healthCheckWrappers
            .filter((wrapper) => wrapper.healthCheck.healthCheckType === type);
        });
    } else {
      return this.API
        .all('search')
        .useCache(this.infrastructureCaches.healthChecks)
        .getList({q: '', type: 'healthChecks'})
        .then(([searchEndPointWrapper]) => {
          let healthCheckWrappers = searchEndPointWrapper.results;
          healthCheckWrappers.forEach((wrapper) => wrapper.healthCheck = JSON.parse(wrapper.healthCheck));
          return healthCheckWrappers;
        })
    }
  }
}

export const GCE_HEALTH_CHECK_READER = 'spinnaker.gce.healthCheck.reader';

module(GCE_HEALTH_CHECK_READER, [
  API_SERVICE,
  require('core/cache/infrastructureCaches.js'),
]).service('gceHealthCheckReader', GceHealthCheckReader);
