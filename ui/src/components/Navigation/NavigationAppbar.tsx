import React, { useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import Routes from './Routes';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, MenuList, MenuItem, ListItemText, Link, Grid, Box } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            marginRight:20,
        },
        drawer: {
            width: 240,
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
        listItem: {},
        listItemText: {
            '& span, & svg': {
                fontSize: '20px',
            }
        },
    }),
);

const NavigationAppbar: React.FC = (props: any) => {
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
                        <Typography variant="h4" className={classes.title}  >
                            Kai
                        </Typography>

                        <MenuList >
                            <Box display="flex" justifyContent="flex-start">
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
                            })}</Box>
                        </MenuList>
                </Toolbar>
                </AppBar>
            </div>
        </div>
    );
};

export default withRouter(NavigationAppbar);