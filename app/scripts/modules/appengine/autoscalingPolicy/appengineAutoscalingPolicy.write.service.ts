import {module, IPromise} from 'angular';
import {TASK_EXECUTOR, ITaskCommand, TaskExecutor, IJob} from 'core/task/taskExecutor';
import {ITask} from 'core/task/task.read.service';
import {Application} from 'core/application/application.model';
import {IAppengineServerGroup} from 'appengine/domain/index';

interface IUpsertAppengineAutoscalingPolicyJob extends IJob {
  serverGroupName: string;
  minIdleInstances: number;
  maxIdleInstances: number;
}

export class AppengineAutoscalingPolicyWriter {
  static get $inject() { return ['taskExecutor']; }

  constructor(private taskExecutor: TaskExecutor) {}

  public upsertAutoscalingPolicy(serverGroup: IAppengineServerGroup,
                                 application: Application,
                                 minIdleInstances: number,
                                 maxIdleInstances: number): IPromise<ITask> {
    const job: IUpsertAppengineAutoscalingPolicyJob = {
      serverGroupName: serverGroup.name,
      minIdleInstances,
      maxIdleInstances,
      credentials: serverGroup.account,
      cloudProvider: 'appengine',
      application: application.name,
      type: 'upsertScalingPolicy',
      region: serverGroup.region,
    };

    const command: ITaskCommand = {
      job: [job],
      application,
      description: `Upsert Autoscaling Policy: ${serverGroup.name}`,
    };

    return this.taskExecutor.executeTask(command);
  }
}

export const APPENGINE_AUTOSCALING_POLICY_WRITER = 'spinnaker.appengine.autoscalingPolicy.write.service';
module(APPENGINE_AUTOSCALING_POLICY_WRITER, [TASK_EXECUTOR])
  .service('appengineAutoscalingPolicyWriter', AppengineAutoscalingPolicyWriter);
