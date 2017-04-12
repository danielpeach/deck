import {module, IComponentController} from 'angular';
import {IModalInstanceService} from 'angular-ui-bootstrap';
import {TASK_MONITOR_BUILDER, TaskMonitorBuilder, TaskMonitor} from 'core/task/monitor/taskMonitor.builder';
import {Application} from 'core/application/application.model';
import {IAppengineServerGroup} from 'appengine/domain/IAppengineServerGroup';
import {
  APPENGINE_AUTOSCALING_POLICY_WRITER,
  AppengineAutoscalingPolicyWriter
} from 'appengine/autoscalingPolicy/appengineAutoscalingPolicy.write.service';
import {ACTION_ICONS} from 'core/widgets/actionIcons/actionIcons.component';

class AppengineEditAutoscalingPolicyModalCtrl implements IComponentController {
  public taskMonitor: TaskMonitor;
  public minIdleInstances: number;
  public maxIdleInstances: number;
  public verification: {verified: boolean};

  static get $inject() {
    return ['$uibModalInstance', 'taskMonitorBuilder', 'application', 'serverGroup',
            'appengineAutoscalingPolicyWriter'];
  }

  constructor(private $uibModalInstance: IModalInstanceService, private taskMonitorBuilder: TaskMonitorBuilder,
              private application: Application, private serverGroup: IAppengineServerGroup,
              private appengineAutoscalingPolicyWriter: AppengineAutoscalingPolicyWriter) { }

  public $onInit(): void {
    this.minIdleInstances = this.serverGroup.scalingPolicy.minIdleInstances;
    this.maxIdleInstances = this.serverGroup.scalingPolicy.maxIdleInstances;
    this.verification = {verified: false};

    this.taskMonitor = this.taskMonitorBuilder.buildTaskMonitor({
      application: this.application,
      title: `Edit scaling policy for ${this.serverGroup.name}`,
      modalInstance: this.$uibModalInstance,
    });

  }

  public submit(): void {
    const submitMethod = () => this.appengineAutoscalingPolicyWriter
      .upsertAutoscalingPolicy(this.serverGroup, this.application, this.minIdleInstances, this.maxIdleInstances);
    this.taskMonitor.submit(submitMethod);
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }
}

export const APPENGINE_EDIT_AUTOSCALING_POLICY_MODAL_CTRL = 'spinnaker.appengine.editAutoscalingPolicy.modal.controller';
module(APPENGINE_EDIT_AUTOSCALING_POLICY_MODAL_CTRL, [
  ACTION_ICONS,
  APPENGINE_AUTOSCALING_POLICY_WRITER,
  TASK_MONITOR_BUILDER,
]).controller('appengineEditAutoscalingPolicyModalCtrl', AppengineEditAutoscalingPolicyModalCtrl);
