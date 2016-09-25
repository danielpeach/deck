import {module} from 'angular';
import {BackendService} from './backendService.model.ts';

class BackendServiceReader {
    static $inject = ['API', 'infrastructureCaches'];

    constructor (private API, private infrastructureCaches) {}

    listBackendServices (): BackendService[] {
      return this.API
        .all('search')
        .useCache(this.infrastructureCaches.backendServices)
        .getList({q:'', type: 'backendServices'});
    }
}

const backendServiceReader = 'spinnaker.deck.gce.backendService.reader.service';

module(
  backendServiceReader, 
  [
    require('../../core/api/api.service.js'),
    require('../../core/cache/infrastructureCaches.js')
  ])
  .service('gceBackendServiceReader', BackendServiceReader)

export default backendServiceReader;