class AppengineAllocationConfigurationRowComponent implements ng.IComponentOptions {
  public bindings: any = { serverGroup: '<', percent: '<', removeAllocation: '&', serverGroups: '<', onAllocationChange: '&' };
  public template: string = `
    <div class="form-group">
      <div class="row">
        <div class="col-md-7">
          <ui-select ng-model="$ctrl.serverGroup" class="form-control input-sm">
            <ui-select-match placeholder="Select...">
              {{$select.selected.name}}
            </ui-select-match>
            <ui-select-choices repeat="serverGroup.name as serverGroup in $ctrl.serverGroups | filter: {name: $select.search}">
              <div ng-bind-html="serverGroup.name | highlight: $select.search"></div>
            </ui-select-choices>
          </ui-select>
        </div>
        <div class="col-md-3">
          <div class="input-group input-group-sm">
            <input type="number"
                   ng-model="$ctrl.percent"
                   class="form-control input-sm"
                   min="0"
                   max="100" 
                   ng-change="$ctrl.onAllocationChange({serverGroupName: $ctrl.serverGroup, allocation: $ctrl.percent})" />
            <span class="input-group-addon">%</span>
          </div>
        </div>
        <div class="col-md-2">
          <a class="btn btn-link sm-label" ng-click="$ctrl.removeAllocation()">
            <span class="glyphicon glyphicon-trash"></span>
          </a>
        </div>
      </div>
    </div>`;
}

export const APPENGINE_ALLOCATION_CONFIGURATION_ROW = 'spinnaker.appengine.allocationConfigurationRow.component';

angular.module(APPENGINE_ALLOCATION_CONFIGURATION_ROW, [])
  .component('appengineAllocationConfigurationRow', new AppengineAllocationConfigurationRowComponent());
