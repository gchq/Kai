import React from 'react';
import {BrowserRouter, Route} from "react-router-dom";
import { RestClient } from '../rest/rest-client';
import ExampleTable from '../components/Tables/ExampleTable';
import {Container, Grid} from '@material-ui/core'
import Navigation from '../components/Navigation/Navigation'

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
  };

  public render() {
    return (
      <div className="App">
         <Grid style={{marginTop: 60}}
                  container
                  direction="row"
                  justify="center"
                  alignItems="center">
                <Grid item>
                    <Navigation/>
                </Grid>
                <Grid item style={{marginLeft: 100}}>
                    <BrowserRouter basename="/">
                        <Route exact path={"/"}>
                        </Route>
                    </BrowserRouter>
                </Grid>
            </Grid>

        
      </div>
    );
  }
}

export default App;
