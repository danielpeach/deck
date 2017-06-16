import {IPromise, module} from 'angular';

import {API_SERVICE, Api} from 'core/api/api.service';
import {IBuild, IJobConfig} from 'core/domain';

export enum BuildServiceType {
  Jenkins, Travis
}

export interface IBuildMaster {
  name: string;
  type: string;
}

export class IgorService {
  constructor(private API: Api) { 'ngInject'; }

  public listMasters(type: string = null): IPromise<string[]> {
    return this.API.one('v2').one('builds').get().then((masters: IBuildMaster[]) => {
      return masters.filter(master => master.type === type).map(master => master.name);
    });
  }

  public listJobsForMaster(master: string): IPromise<string[]> {
    return this.API.one('v2').one('builds').one(master).one('jobs').get();
  }

  public listBuildsForJob(master: string, job: string): IPromise<IBuild[]> {
    return this.API.one('v2').one('builds').one(master).one('builds').one(job).get();
  }

  public getJobConfig(master: string, job: string): IPromise<IJobConfig> {
    return this.API.one('v2').one('builds').one(master).one('jobs').one(job).get();
  }
}

export const IGOR_SERVICE = 'spinnaker.core.ci.jenkins.igor.service';
module(IGOR_SERVICE, [
  API_SERVICE,
]).factory('igorService', (API: Api) => new IgorService(API));
