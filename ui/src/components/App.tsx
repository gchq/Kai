import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Routes from './Navigation/Routes';
import NavigationAppbar from './Navigation/NavigationAppbar';
import {
    AppBar,
    Toolbar,
    Typography,
    ListItemText,
    Drawer,
    Divider,
    ListItem,
    List,
    ListItemIcon,
    Avatar,
    ListItemAvatar,
    Grid,
} from '@material-ui/core';

function App() {
    return (
        <div style={{ display: 'flex' }}>
            <NavigationAppbar />
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
