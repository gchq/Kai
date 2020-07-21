import React from 'react';
import {makeStyles, Typography, Grid, Divider, Box, Container, Paper} from "@material-ui/core";
import ExampleTable from './Tables/ExampleTable'

const useStyles = makeStyles((theme) => ({
    root: {
        //width: '100%',
        marginTop: 10
    },
    container: {
        width: '40%'
    },

}));
export default function Page1() {
    const classes = useStyles();

    return (
        <Grid className={classes.root}
              container
              justify="center"
        >
            <Paper>
                <ExampleTable/>
            </Paper>



        </Grid>




    );

}