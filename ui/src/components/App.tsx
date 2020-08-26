import React from 'react';
import {Route, Switch, Redirect} from "react-router-dom";
import Routes from "./Navigation/Routes";
import NavigationAppbar from "./Navigation/NavigationAppbar";

function App() {

    return (
        <div>
            <NavigationAppbar/>
            <Switch>
                <Redirect exact from="/" to="/AddGraph" />
                {Routes.map((route: any) => (
                    <Route exact path={route.path} key={route.path}>
                        <route.component />
                    </Route>
                ))}
            </Switch>
        </div>
    );
  }

  export default App;
