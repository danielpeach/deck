import * as React from 'react';
import { FormikErrors, FormikProps, FormikValues } from 'formik';

import { IWizardPageProps, wizardPage, Application } from '@spinnaker/core';

import { YamlEditor } from 'kubernetes/v2/manifest/yaml/YamlEditor';
import { IKubernetesManifestCommandData } from 'kubernetes/v2/manifest/manifestCommandBuilder.service';
import { Subject } from 'rxjs/Subject';

export interface IServerGroupBasicSettingsProps extends IWizardPageProps {
  app: Application;
  manifestChangeStream: Subject<void>;
}

class ManifestEntryImpl extends React.Component<IServerGroupBasicSettingsProps> {
  public static LABEL = 'Manifest';

  constructor(props: IServerGroupBasicSettingsProps & IWizardPageProps & FormikProps<IKubernetesManifestCommandData>) {
    super(props);
    this.state = {
      manifests: props.formik.values.command.manifests,
    };
    props.manifestChangeStream.subscribe(manifests => {
      this.setState({ manifests });
    });
  }

  public validate = (_values: FormikValues): FormikErrors<IKubernetesManifestCommandData> => {
    const errors = {} as FormikErrors<IKubernetesManifestCommandData>;
    return errors;
  };

  private handleChange = (manifests: any) => {
    const { formik } = this.props;
    if (!formik.values.command.manifests) {
      formik.values.command.manifests = [];
    }
    Object.assign(formik.values.command.manifests, Array.isArray(manifests) ? manifests : [manifests]);
    this.props.manifestChangeStream.next(formik.values.command.manifests);
  };

  public render() {
    const manifests = this.state.manifests;
    const [first = null, ...rest] = manifests || [];
    const manifest = rest && rest.length ? manifests : first;
    return <YamlEditor value={manifest} onChange={this.handleChange} />;
  }
}

export const ManifestEntry = wizardPage<IServerGroupBasicSettingsProps>(ManifestEntryImpl);
