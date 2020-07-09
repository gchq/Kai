import React from 'react';
import { RestClient } from '../rest/rest-client';

interface IState {
  graphs: Array<Object>;
}

class App extends React.Component<{},IState> {
  constructor() {
    super({});
    this.state = { graphs: [] };
  }


  public async componentDidMount() {
    const graphs = await RestClient.getAllGraphs();
    this.setState({ graphs: graphs })
  }

  public render() {
    return (
      <div className="App">
        <span>Hello Word</span>
        <p>{JSON.stringify(this.state.graphs)}</p>
      </div>
    );
  }

}

export default App;
