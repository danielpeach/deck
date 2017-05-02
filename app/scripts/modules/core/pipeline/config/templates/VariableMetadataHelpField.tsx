import * as React from 'react';
import {IVariableMetadata} from './pipelineTemplate.service';
import {HelpField} from 'core/help/HelpField';

interface IProps {
  metadata: IVariableMetadata
}

interface IState { }

export class VariableMetadataHelpField extends React.Component<IProps, IState> {

   public render() {
     return HelpField ? (<HelpField content={this.getContent()}/>) : null;
   }

   private getContent(): string {
     let content = `<p>${this.props.metadata.description}</p>
                    <p><strong>Type:</strong> <code>${this.props.metadata.type}</code></p>`;

     if (this.props.metadata.example) {
       content += `<p><strong>Example:</strong> <br> <pre class="small">${this.props.metadata.example}</pre></p>`;
     }
     return content;
   }
}
