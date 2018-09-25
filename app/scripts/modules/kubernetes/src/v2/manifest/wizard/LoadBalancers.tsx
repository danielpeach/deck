import * as React from 'react';
import { Select } from 'react-select';
import { FormikErrors, FormikProps, FormikValues } from 'formik';

import { NgReact, HelpField, IWizardPageProps, wizardPage, Application } from '@spinnaker/core';

import { IKubernetesManifestCommandData } from 'kubernetes/v2/manifest/manifestCommandBuilder.service';

export interface IManifestBasicSettingsProps {
  app: Application;
}

class ManifestLoadBalancersImpl extends React.Component<
  IManifestBasicSettingsProps & IWizardPageProps & FormikProps<IKubernetesManifestCommandData>
> {
  public static LABEL = 'Load Balancers';

  constructor(props: IManifestBasicSettingsProps & IWizardPageProps & FormikProps<IKubernetesManifestCommandData>) {
    super(props);
  }

  public validate = (_values: FormikValues): FormikErrors<IKubernetesManifestCommandData> => {
    const errors = {} as FormikErrors<IKubernetesManifestCommandData>;
    return errors;
  };

  public render() {
    const { values, app } = this.props;

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Load Balancers</div>
          <div className="col-md-7">
            <Select isMulti={true} options={[{ value: 'my-load-balancer', label: 'wow!' }]} />
          </div>
        </div>
      </div>
    );
  }
}

export const ManifestLoadBalancers = wizardPage<IManifestBasicSettingsProps>(ManifestLoadBalancersImpl);
