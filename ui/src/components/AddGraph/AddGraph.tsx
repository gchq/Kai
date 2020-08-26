import React from 'react';
import {Button, Container, CssBaseline, Grid, IconButton, makeStyles, TextField, Typography, Toolbar} from "@material-ui/core";
import {Schema} from '../../domain/schema';
import {Notifications} from '../../domain/notifications';
import {CreateGraphRepo} from '../../rest/repositories/create-graph-repo';
import {Alert} from "@material-ui/lab";
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

interface IState {
    newGraph: {
        graphId: string,
        administrators: Array<string>,
        schemaJson: string,
    }
    notifications: Notifications,
}

export default class AddGraph extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            newGraph: {
                graphId: "",
                administrators: [],
                schemaJson: "",
            },
            notifications: new Notifications(),
        }

    }

    private classes: any = makeStyles((theme) => ({
        root: {
            width: '100%',
            marginTop: 40
        },
        paper: {
            marginTop: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main,
        },
        form: {
            width: '100%', // Fix IE 11 issue.
            marginTop: theme.spacing(3),
        },
        submit: {
            margin: theme.spacing(3, 0, 2),
        },
        button: {
            margin: "10px",
        }
    }));

    private async submitNewGraph() {
        const {graphId, administrators, schemaJson} = this.state.newGraph;
        const schema = new Schema(schemaJson);
        const notifications: Notifications = schema.validation();

        if (notifications.isEmpty()) {
            await new CreateGraphRepo().create(graphId, administrators, schema);

        } else {
            this.setState({notifications: notifications});
        }
    }

    public render() {
        return (
            <main>
                <Toolbar />
                <Grid style={{marginTop:30}}
                    container
                    justify="center">


                    <Container component="main" maxWidth="xs">
                        <CssBaseline/>
                        {!this.state.notifications.isEmpty() &&
                        <Alert variant="outlined"
                            severity="error">Error(s): {this.state.notifications.errorMessage()}</Alert>}
                        <div className={this.classes.paper}>

                            <form className={this.classes.form} noValidate>


                                <Grid container spacing={2}>
                                    <Grid item xs={12}>

                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id="graphId"
                                            label="Graph ID"
                                            name="graphId"
                                            autoComplete="graph-id"
                                            onChange={(event) => {
                                                this.setState({
                                                    newGraph: {
                                                        ...this.state.newGraph,
                                                        graphId: event.target.value
                                                    }
                                                });
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}
                                        container
                                        direction="row"
                                        justify="flex-end"
                                        alignItems="center"
                                    >
                                        <IconButton>
                                            <InsertDriveFileOutlinedIcon/>
                                        </IconButton>
                                        <IconButton>
                                            <DeleteOutlineOutlinedIcon/>
                                        </IconButton>

                                    </Grid>

                                    <Grid item xs={12}>

                                        <TextField
                                            style={{width: 400}}
                                            id="schema"
                                            label="Schema"
                                            required
                                            multiline
                                            rows={15}
                                            variant="outlined"
                                            onChange={(event) => {
                                                this.setState({
                                                    newGraph: {
                                                        ...this.state.newGraph,
                                                        schemaJson: event.target.value
                                                    }
                                                });
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        </div>
                    </Container>
                    <Grid
                        container
                        style={{margin:10}}
                        direction="row"
                        justify="center"
                        alignItems="center">
                        <Button onClick={() => {
                            this.submitNewGraph()
                        }}
                                type="submit"
                                variant="outlined"
                                color="primary"
                                className={this.classes.submit}
                        >
                            Add Graph
                        </Button>
                    </Grid>
                </Grid>
            </main>
        )
    }
}
