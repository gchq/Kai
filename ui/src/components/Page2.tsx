import React from 'react';
import {makeStyles, Typography, Grid, Divider, Box, Container, Paper} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        marginTop: 10
    },
    container: {
        width: '40%'
    },

}));
export default function Page2() {
    const classes = useStyles();

    return (
        <Grid className={classes.root}
              container
              justify="center"
        >
            <Typography variant="h3">
                Page 2
            </Typography>


        </Grid>




    );

}