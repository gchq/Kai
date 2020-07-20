import React, {useState} from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import {Drawer, CssBaseline, AppBar, Toolbar, List, Typography, Divider, IconButton, Tab, Tabs, ClickAwayListener} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {BrowserRouter,Switch,Route,Link} from "react-router-dom";

import Page1 from '../Page1';
import Page2 from '../Page2'
import TabPanel from './TabPanel';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    //display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },

}));

function a11yProps(index: number) {
  return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Navigation() {
  const allTabs = ['/', '/Page1', '/Page2'];
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const [tab, setTab] = useState(0);
    const handleTabChange = (e: any, newValue: React.SetStateAction<number>) => {
        setTab(newValue);
        setOpen(false)
    };
    console.log(tab);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Kai
          </Typography>
        </Toolbar>
      </AppBar>
      <BrowserRouter>
      </BrowserRouter>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}

      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        
        
        <Divider />

        <Tabs value={tab} onChange={handleTabChange} orientation={'vertical'} indicatorColor="primary" textColor="primary">
                    <Tab label={"Page 1"} {...a11yProps(0)}  />
                    <Tab label={"Page 2"} {...a11yProps(1)} />
                    <Tab label={"Page 3"} {...a11yProps(2)} />
                    <Divider />
                    <Tab label={"Page 4"} {...a11yProps(3)} />
                    <Tab label={"Page 5"} {...a11yProps(4)} />
                    <Tab label={"Page 6"} {...a11yProps(5)} />
                    <Divider />
                    <Tab label={"Page 7"} {...a11yProps(6)} />
                    <Tab label={"Page 8"} {...a11yProps(7)} />
                </Tabs>

      </Drawer>
    

      

          
            <TabPanel value={tab} index={0}>

              <Page1/>


            </TabPanel>
            <TabPanel value={tab} index={1}>

              <Page2/>


            </TabPanel>


  

    </div>
    
  );
}
