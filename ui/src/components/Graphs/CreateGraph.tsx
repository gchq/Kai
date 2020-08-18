import React from 'react';
import {
    Button,
    Container,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    IconButton,
    Slide,
    TextField,
    Typography
} from '@material-ui/core'
import { Alert } from '@material-ui/lab';
import {TransitionProps} from '@material-ui/core/transitions';
import ClearIcon from "@material-ui/icons/Clear";
import {makeStyles} from "@material-ui/core/styles";
import {RestClient} from "../../rest/rest-client";
import { Schema } from '../../domain/schema';
import { Notifications } from '../../domain/notifications';

const useStyles = makeStyles((theme) => ({
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

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface IState {
    dialogIsOpen: boolean,
    graphId: string,
    schema: string,
    administrators: Array<string>,
    notifications: Notifications,
}

export default class CreateGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            dialogIsOpen: false,
            graphId: "",
            administrators: [],
            schema: "",
            notifications: new Notifications(),
        }
    }

    private classes: any = makeStyles((theme) => ({
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
        const { graphId, administrators, schema } = this.state;
        const _schema = new Schema(schema);
        const notifications: Notifications = _schema.validation();

        if (notifications.isEmpty()) {
            await RestClient.createNewGraph(graphId, administrators, _schema);
            this.setState({ dialogIsOpen: false });

        } else {
            this.setState({ notifications: notifications });
        }
    }

    public render() {
        const openDialogBox = () => {
            this.setState({ dialogIsOpen: true });
        };
        const closeDialogBox = () => {
            this.setState({ dialogIsOpen: false });
        };

        return (
            <div>
                <Button variant="outlined" color="primary" onClick={openDialogBox} style={{margin: "10px"}}>
                    Create Graph
                </Button>
                <Dialog
                    open={this.state.dialogIsOpen}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={closeDialogBox}
                    style={{minWidth: '500px'}}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <Grid
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="flex-start"
                    >
                        <IconButton onClick={closeDialogBox}>
                            <ClearIcon/>
                        </IconButton>

                    </Grid>

                    <DialogContent>
                        <Container component="main" maxWidth="xs">
                            <CssBaseline/>
                            {!this.state.notifications.isEmpty() &&
                                <Alert variant="outlined" severity="error">Error(s): {this.state.notifications.errorMessage()}</Alert>}
                            <div className={this.classes.paper}>
                                <Typography component="h2" variant="h5">
                                    Create Graph
                                </Typography>
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
                                                    this.setState( {
                                                        newGraph: {
                                                            ...this.state.newGraph,
                                                            graphId: event.target.value
                                                        }
                                                    });
                                                }}
                                            />
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
                                                            schema: event.target.value
                                                        }
                                                    });
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                            </div>
                        </Container>
                    </DialogContent>
                    <DialogActions>
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center">
                            <Button onClick={() =>{this.submitNewGraph()}}
                                    type="submit"
                                // fullWidth
                                    variant="outlined"
                                    color="primary"
                                    className={this.classes.submit}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
