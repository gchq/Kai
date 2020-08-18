import React from 'react';
import {makeStyles, Grid, Paper} from "@material-ui/core";
import ExampleTable from './Graphs/ExampleTable'

const useStyles = makeStyles((theme) => ({
    root: {
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
