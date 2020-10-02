import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import Routes from './Routes';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, ListItemText, Drawer, Divider, ListItem, List, ListItemIcon, Avatar, ListItemAvatar, CssBaseline } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import PersonIcon from '@material-ui/icons/Person';
import LockOpenIcon from '@material-ui/icons/LockOpen';

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            marginRight: 20,
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        icon: {
            color: '#696666',
            margin: '20px',
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
            flexDirection: 'row',
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: '#607D8B',
            boxShadow: '0px 0px 0px 0px',
            zIndex: theme.zIndex.drawer + 1,
        },
        listItem: {
            color: '#696666',
        },
        listItemText: {
            '& span, & svg': {
                fontSize: '20px',
            },
        },
    })
);

const NavigationAppbar: React.FC = (props: any) => {
    const classes = useStyles();

    const activeRoute = (routeName: any) => {
        return props.location.pathname === routeName;
    }

    const getSideNavIcon = (sidebarName: any) => {
        switch (sidebarName) {
            case 'Add Graph':
                return <AddCircleOutlineIcon />;
            case 'View Graphs':
                return <VisibilityIcon />;
            case 'User Guide':
                return <LocalLibraryIcon />;
            case 'User Login':
                return <LockOpenIcon />;   
            default:
                return null;
        }
    };

    return (
        <div className={classes.root}>
            <CssBaseline />

            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Graph As Service
                    </Typography>
                </Toolbar>
            </AppBar>

            <nav className={classes.drawer}>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}>
                    <Toolbar />
                    <div className={classes.drawerContainer}>
                        <List>
                            <ListItem className={classes.listItem}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText primary="User" secondary="someuser@mail.com" />
                            </ListItem>
                        </List>
                        <Divider />
                        <List>
                            {Routes.map((prop, key) => {
                                return (
                                    <NavLink
                                        to={prop.path}
                                        style={{ color: 'inherit', textDecoration: 'inherit' }}
                                        key={key}>
                                        <ListItem className={classes.listItem} selected={activeRoute(prop.path)}>
                                            <ListItemIcon>{getSideNavIcon(prop.sidebarName)}</ListItemIcon>
                                            <ListItemText
                                                classes={{ primary: classes.listItemText }}
                                                primary={prop.sidebarName}
                                            />
                                        </ListItem>
                                    </NavLink>
                                );
                            })}
                        </List>
                        <Divider />
                    </div>
                </Drawer>
            </nav>
        </div>
    );
};

export default withRouter(NavigationAppbar);
