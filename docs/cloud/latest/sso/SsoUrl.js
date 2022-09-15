import React from 'react';
import CodeBlock from '../../../../../src/components/CodeBlock';
import Copy from './Copy.js';

const makeSsoUrl = (company) => {
  if (!company) {
    company = "<company-id>"
  }
  return `https://app.getambassador.io/auth/realms/production/broker/${company}/endpoint/clients/${company}`
}

class SsoUrl extends React.Component {

  constructor(props) {
    super(props);
    this.state = {company: ""};
  }

  handleInput(event) {
    this.setState({company: event.target.value});
  }

  checkInput(content) {
    if (this.state.company === "") {
      return "Please supply your case sensitive company ID in the input above to get a correct URL.";
    }
  }

  render() {
    return (
      <div className="sso-url">
        Enter your case sensitive company ID here <input type="text" size="10" defaultValue={this.state.company} name="company" placeholder="<company-id>" onInput={this.handleInput.bind(this)}/> and then copy this URL to use in step 7:
        
        <div style={{margin: "1em", "margin-left": "2em"}}><Copy content={makeSsoUrl(this.state.company)}
                                                                 validator={this.checkInput.bind(this)}/></div>
      </div>
    );
  }
}

export default SsoUrl;
