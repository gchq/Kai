import React, { useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import Routes from './Routes';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, MenuList, MenuItem, ListItemText, Link, Grid, Box, Drawer, Divider, List, ListItem, ListItemIcon, IconButton} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';

const drawerWidth = 240;
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
            flexShrink: 0,
        },
        icon: {
            color: '#696666',
            margin: '20px'
        },
        drawerPaper: {
            width: drawerWidth,
          },
        drawerContainer: {
        overflow: 'auto',
        },
          // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
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
            backgroundColor: "#607D8B",
            boxShadow: "0px 0px 0px 0px",
            zIndex: theme.zIndex.drawer + 1,
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
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}  >
                            Graph As Service
                        </Typography>

                       
                </Toolbar>
                </AppBar>
             
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                    paper: classes.drawerPaper,
                    }}
                    >
                    <Toolbar />    
                    <div className={classes.drawerContainer}>
                 
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
                   
                    <Divider />
                    </div>
                </Drawer>
                
            </div>
       
    );
};

export default withRouter(NavigationAppbar);

