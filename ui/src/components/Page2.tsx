import React from 'react';
import {makeStyles, Typography, Grid, Divider, Box, Container, Paper} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    container: {
        width: '40%'
    },

}));
export default function Page2() {
    const classes = useStyles();

    return (
        <Grid className={classes.root}
              direction="column"
              justify="center"
              alignItems="center">
            <Paper>
                Page 2

            </Paper>


        </Grid>




    );

}