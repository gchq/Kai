import React from 'react';
import {BrowserRouter, Route} from "react-router-dom";
import { RestClient } from '../rest/rest-client';
import ExampleTable from '../components/Tables/ExampleTable';
import {Container, Grid} from '@material-ui/core'
import Navigation from '../components/Navigation/Navigation'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import {blue, purple} from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
interface IState {
  graphs: Array<Object>;

}



export default function App() {


    return (
       <div className="App">
            <Grid style={{marginTop: 70}}
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
            >
                <Grid item>
                    <Navigation/>
                </Grid>
                <Grid item>
                    <BrowserRouter basename="/">
                        <Route exact path={"/"}>
                        </Route>
                    </BrowserRouter>
                </Grid>
            </Grid>

        </div>
    );
  }



