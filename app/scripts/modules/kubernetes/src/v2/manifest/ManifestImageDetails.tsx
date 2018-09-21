import * as React from 'react';
import { has, sortBy } from 'lodash';

import { HelpField } from '@spinnaker/core';

export interface IContainer {
  name: string;
  image: string;
}

export interface IManifestImageDetailsProps {
  manifest: {
    spec: {
      template: {
        spec: {
          containers: IContainer;
          initContainers: IContainer;
        };
      };
    };
  };
}

export const ManifestImageDetails = ({ manifest }: IManifestImageDetailsProps) => {
  if (!has(manifest, 'spec.template.spec')) {
    // Could still be loading the manifest.
    return null;
  }
  const containers = sortBy(manifest.spec.template.spec.containers || [], ['image']);
  const initContainers = sortBy(manifest.spec.template.spec.initContainers || [], ['image']);
  if (initContainers.length === 0 && containers.length === 0) {
    // Not sure if this could happen
    return <span>No images.</span>;
  }

  return (
    <ul>
      {containers.map(container => (
        <li key={container.image} title={container.image} className="break-word">
          {container.image} <HelpField content={`This is container <strong>${container.name}</strong>'s image.`} />
        </li>
      ))}
      {initContainers.map(container => (
        <li key={container.image} className="break-word" title={container.image}>
          {container.image} <HelpField content={`This is init container <strong>${container.name}</strong>'s image.`} />
        </li>
      ))}
    </ul>
  );
};
