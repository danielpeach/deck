import * as React from 'react';
import { Creatable, Option } from 'react-select';

import { IAccountDetails, SETTINGS, StageConfigField, NgReact, AccountService } from '@spinnaker/core';

import { IManifestSelector } from 'kubernetes/v2/manifest/selector/IManifestSelector';

export interface IManifestSelectorProps {
  selector: IManifestSelector;
  onChange(): void;
}

export interface IManifestSelectorState {
  accounts: IAccountDetails[];
  selector: IManifestSelector;
  namespaces: string[];
  kinds: string[];
}

export class ManifestSelector extends React.Component<IManifestSelectorProps, IManifestSelectorState> {
  constructor(props: IManifestSelectorProps) {
    super(props);
    this.state = {
      accounts: [],
      selector: this.props.selector,
      namespaces: [],
      kinds: [],
    };
  }

  public componentDidMount = (): void => {
    AccountService.getAllAccountDetailsForProvider('kubernetes', 'v2').then(accounts => {
      const selector = this.state.selector;
      if (!selector.account && accounts.length > 0) {
        selector.account = accounts.some(e => e.name === SETTINGS.providers.kubernetes.defaults.account)
          ? SETTINGS.providers.kubernetes.defaults.account
          : accounts[0].name;
      }

      this.setState({ accounts });
      if (selector.account) {
        this.handleAccountChange(selector.account);
      }
    });
  };

  private handleAccountChange = (selectedAccount: string): void => {
    const details = (this.state.accounts || []).find(account => account.name === selectedAccount);
    if (!details) {
      return;
    }

    this.setState({
      namespaces: details.namespaces.sort(),
      kinds: Object.keys(details.spinnakerKindMap).sort(),
    });
    this.props.onChange();
  };

  private handleNamespaceChange = (selectedNamespace: Option): void => {
    this.state.selector.location =
      selectedNamespace && selectedNamespace.value ? (selectedNamespace.value as string) : null;
    this.setState({ selector: this.state.selector });
    this.props.onChange();
  };

  private handleKindChange = (selectedKind: Option): void => {
    const [, name] = (this.state.selector.manifestName || '').split(' ');
    this.state.selector.manifestName = !!selectedKind
      ? name
        ? `${selectedKind.value} ${name}`
        : (selectedKind.value as string)
      : null;
    this.setState({ selector: this.state.selector });
  };

  private handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const [kind] = (this.state.selector.manifestName || '').split(' ');
    this.state.selector.manifestName = kind ? `${kind} ${event.target.value}` : ` ${event.target.value}`;
    this.setState({ selector: this.state.selector });
    this.props.onChange();
  };

  public render() {
    const { AccountSelectField } = NgReact;
    const { selector, accounts, kinds, namespaces } = this.state;
    const [kind, name] = (selector.manifestName || '').split(' ');

    return (
      <>
        <StageConfigField label="Account">
          <AccountSelectField
            component={selector}
            field="account"
            accounts={accounts}
            onChange={this.handleAccountChange}
            provider="'kubernetes'"
          />
        </StageConfigField>
        <StageConfigField label="Namespace">
          <Creatable
            clearable={false}
            value={{ value: selector.location, label: selector.location }}
            options={namespaces.map(ns => ({ value: ns, label: ns }))}
            onChange={this.handleNamespaceChange}
          />
        </StageConfigField>
        <StageConfigField label="Kind">
          <Creatable
            clearable={false}
            value={{ value: kind, label: kind }}
            options={kinds.map(k => ({ value: k, label: k }))}
            onChange={this.handleKindChange}
          />
        </StageConfigField>
        <StageConfigField label="Name">
          <input value={name} onChange={this.handleNameChange} className="form-control input-sm" />
        </StageConfigField>
      </>
    );
  }
}
