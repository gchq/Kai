import React from 'react';
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import Routes from "./Navigation/Routes";
import Nav from "./Navigation/NavigationAppbar";

import { RestClient } from '../rest/rest-client';
import ExampleTable from '../components/Tables/ExampleTable';
import {Container, Grid} from '@material-ui/core'
import Navigation from './Navigation/NavigationDrawer'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import {blue, purple} from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import NavigationDrawer from "./Navigation/NavigationDrawer";
import NavigationAppbar from "./Navigation/NavigationAppbar";
interface IState {
  graphs: Array<Object>;

}



export default function App() {


    return (
       // <div className="App">
       //      <Grid style={{marginTop: 70}}
       //            container
       //            direction="row"
       //            justify="center"
       //            alignItems="center"
       //      >
       //          <Grid item>
       //              <Navigation/>
       //          </Grid>
       //          <Grid item>
       //
       //          </Grid>
       //      </Grid>
       //
       //  </div>
        <div>


            <NavigationAppbar/>
            <Switch>
                <Redirect exact from="/" to="/Page1" />
                {Routes.map((route: any) => (
                    <Route exact path={route.path} key={route.path}>
                        <route.component />
                    </Route>
                ))}
            </Switch>
        </div>
    );
  }



