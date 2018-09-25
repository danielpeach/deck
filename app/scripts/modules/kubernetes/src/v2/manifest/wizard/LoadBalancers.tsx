import * as React from 'react';
import { Creatable, Option } from 'react-select';
import { FormikErrors, FormikProps, FormikValues } from 'formik';

import { IWizardPageProps, wizardPage, Application } from '@spinnaker/core';

import { IKubernetesManifestCommandData } from 'kubernetes/v2/manifest/manifestCommandBuilder.service';
import { ILoadBalancer } from '../../../../../core/src/domain';
import { Subject } from 'rxjs/Subject';

export interface IManifestBasicSettingsProps extends IWizardPageProps {
  app: Application;
  manifestChangeStream: Subject<any>;
}

class ManifestLoadBalancersImpl extends React.Component<IManifestBasicSettingsProps> {
  public static LABEL = 'Load Balancers';

  public static canReceiveTraffic = (manifest: any) => {
    return manifest && manifest.kind.toLowerCase() === 'deployment';
  };

  constructor(props: IManifestBasicSettingsProps & IWizardPageProps & FormikProps<IKubernetesManifestCommandData>) {
    super(props);

    this.state = {
      manifests: this.props.formik.values.command.manifests,
    };
    this.props.manifestChangeStream.subscribe(manifests => {
      console.log('manifests', manifests);
      this.setState({ manifests });
    });
  }

  public handleLoadBalancerSelect = (options: Option) => {
    const manifests = this.state.manifests;
    const loadBalancers = (options || []).map(o => o.value);
    if (loadBalancers.length) {
      manifests[0].metadata.annotations['traffic.spinnaker.io/load-balancers'] = JSON.stringify(loadBalancers);
    } else {
      delete manifests[0].metadata.annotations['traffic.spinnaker.io/load-balancers'];
    }

    this.props.manifestChangeStream.next(manifests);
    this.setState({ manifests: manifests });
  };

  public validate = (_values: FormikValues): FormikErrors<IKubernetesManifestCommandData> => {
    const errors = {} as FormikErrors<IKubernetesManifestCommandData>;
    return errors;
  };

  public render() {
    const manifests = this.state.manifests;
    if (manifests.length > 1) {
      return (
        <div>
          Spinnaker manages traffic on Kubernetes resources using a special annotation,
          <code>traffic.spinnaker.io/load-balancers</code>. You are deploying multiple manifests, so the UI doesn't feel
          comfortable making assumptions about your traffic. If you want Spinnaker to manage traffic on these resources,
          use the special annotation.
        </div>
      );
    }
    const manifest = manifests[0];
    if (!ManifestLoadBalancersImpl.canReceiveTraffic(manifest)) {
      return <div>You're managing something that can't receive traffic! Oh well.</div>;
    }

    const loadBalancers = this.props.app
      .getDataSource('loadBalancers')
      .data.filter(loadBalancer => loadBalancer.account === this.props.formik.values.command.account)
      .map((loadBalancer: ILoadBalancer) => {
        return { value: loadBalancer.name, label: loadBalancer.name };
      });

    let value = [];
    if (this.state.manifests.length) {
      value = JSON.parse(
        this.state.manifests[0].metadata.annotations['traffic.spinnaker.io/load-balancers'] || '[]',
      ).map(loadBalancer => ({ value: loadBalancer, label: loadBalancer }));
    }
    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Load Balancers</div>
          <div className="col-md-7">
            <Creatable multi={true} options={loadBalancers} value={value} onChange={this.handleLoadBalancerSelect} />
          </div>
        </div>
      </div>
    );
  }
}

export const ManifestLoadBalancers = wizardPage<IManifestBasicSettingsProps>(ManifestLoadBalancersImpl);
