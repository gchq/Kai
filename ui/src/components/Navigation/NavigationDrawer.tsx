import React, { useState } from 'react';

import { NavLink, withRouter } from 'react-router-dom';
import Routes from './Routes';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    AppBar, Toolbar, Typography,
    IconButton, Drawer, MenuList,
    MenuItem, ListItemText, Link,
    Grid, Box
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            //flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            //flexGrow: 1,
            marginRight:20,
        },
        drawer: {
            width: 240,
            //flexShrink: 0,
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        fullList: {
            width: 'auto',
            flexDirection: 'row'
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),

        },
        listItem: {
            //width: 240,
        },
        listItemText: {

            '& span, & svg': {
                fontSize: '20px',
            }
        },
    }),
);

const NavigationDrawer: React.FC = (props: any) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const toggleDrawer = (open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setIsOpen(open);
    };

    const activeRoute = (routeName: any) => {
        return props.location.pathname === routeName ? true : false;
    }

    return (
        <div>
            <div className={classes.root}>
                <AppBar position="static" className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h4" className={classes.title}  >
                            Kai
                        </Typography>

                    </Toolbar>
                </AppBar>
            </div>
            <Drawer classes={{ paper: classes.drawer }} open={isOpen} onClose={toggleDrawer(false)}>
                <div
                    className={classes.fullList}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <MenuList >
                        {Routes.map((prop, key) => {
                            return (
                                <NavLink to={prop.path}
                                         style={{ color: 'inherit', textDecoration: 'inherit'}}
                                         key={key}>

                                    <MenuItem className={classes.listItem} selected={activeRoute(prop.path)}>

                                        <ListItemText classes={{primary: classes.listItemText}} primary={prop.sidebarName}/>

                                    </MenuItem>
                                </NavLink>
                            );
                        })}
                    </MenuList>
                </div>
            </Drawer>
        </div>
    );
};

export default withRouter(NavigationDrawer);
