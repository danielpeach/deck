import {module, IComponentOptions} from 'angular';

class ActionIconsComponent implements IComponentOptions {
  public bindings: any = {
    edit: '&',
    editInfo: '@',
    destroy: '&',
    destroyInfo: '@',
  };
  public templateUrl = require('./actionIcons.component.html');
}

export const ACTION_ICONS = 'spinnaker.core.actionIcons.component';
module(ACTION_ICONS, [])
  .component('actionIcons', new ActionIconsComponent());
