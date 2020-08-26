import React from 'react';
import {
    Button,
    Container,
    CssBaseline,
    Dialog, DialogActions, DialogContent,
    Grid,
    IconButton,
    makeStyles, Slide,
    TextField,
    Typography
} from "@material-ui/core";
import {Schema} from '../../domain/schema';
import {Notifications} from '../../domain/notifications';
import {CreateGraphRepo} from '../../rest/repositories/create-graph-repo';
import {Alert} from "@material-ui/lab";
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import {DropzoneArea} from 'material-ui-dropzone'
import ClearIcon from "@material-ui/icons/Clear";
import {DropzoneDialog} from 'material-ui-dropzone'
import {TransitionProps} from "@material-ui/core/transitions";
import Toolbar from "@material-ui/core/Toolbar";

interface IState {
    dialogIsOpen: boolean,
    files: Array<any>,
    newGraph: {
        graphId: string,
        administrators: Array<string>,
        schemaJson: string,
    }
    notifications: Notifications,
}
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default class AddGraph extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            dialogIsOpen: false,
            files: [],
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
        },
        previewChip: {
            minWidth: 160,
            maxWidth: 210
        },
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
    private async setFiles(files: Array<any>){
        this.setState({
            files: files
        });
    }
    private async checkFiles(files: Array<any>){

    }

    public render() {
        const openDialogBox = () => {
            this.setState({ dialogIsOpen: true });
        };
        const closeDialogBox = () => {
            this.setState({ dialogIsOpen: false });
        };
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
                                    <IconButton onClick={openDialogBox}>
                                        <InsertDriveFileOutlinedIcon/>
                                    </IconButton>
                                   
                                        <DropzoneDialog
                                            open={this.state.dialogIsOpen}
                                            onSave={this.setFiles.bind(this)}
                                            showPreviews={true}


                                            onClose={closeDialogBox}
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
                </Grid>
                <Grid
                    container
                    style={{margin:10}}
                    direction="row"
                    justify="center"
                    alignItems="center">
                    <Button onClick={() => {
                        // this.submitNewGraph()
                        console.log(this.state.files[0].name)
                    }}
                            type="submit"
                            variant="outlined"
                            color="primary"
                            className={this.classes.submit}
                    >
                        Add Graph
                    </Button>
                </Grid>
            </main>
        )
    }
}
