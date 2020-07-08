import React from 'react';
import { RestClient } from '../rest/rest-client';

class App extends React.Component<{},{}> {

  public async componentDidMount() {
    new RestClient('www.aws.com/myworkspace');
    const graphs = await RestClient.getAllGraphs();
    this.setState({ graphs })
  }

  public render() {
    return (
      <div className="App">
        <span>Hello Word</span>
      </div>
    );
  }

}

export default App;
