import React from 'react';
import {
    Button,
    Container,
    CssBaseline,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    makeStyles,
    Slide,
    TextField
} from "@material-ui/core";
import {Schema} from '../../domain/schema';
import {Notifications} from '../../domain/notifications';
import {CreateGraphRepo} from '../../rest/repositories/create-graph-repo';
import {Alert} from "@material-ui/lab";
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import {DropzoneArea} from 'material-ui-dropzone'
import ClearIcon from "@material-ui/icons/Clear";
import {TransitionProps} from "@material-ui/core/transitions";
import Toolbar from "@material-ui/core/Toolbar";

interface IState {
    dialogIsOpen: boolean,
    files: Array<File>,
    schemaFieldDisable: boolean,
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
            schemaFieldDisable: false,
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

    private async setFiles(files: Array<File>) {
        this.setState({
            files: files
        });
    }

    private async getSchema(files: Array<File>) {
        const file = await files[0].text();
        return file

    }

    public render() {
        const openDialogBox = () => {
            this.setState({dialogIsOpen: true});
        };
        const closeDialogBox = () => {
            this.setState({dialogIsOpen: false});
        };
        return (
            <main>
                <Toolbar/>
                <Grid style={{marginTop: 30}}
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
                                            value={this.state.newGraph.graphId}
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
                                                <DropzoneArea
                                                    showPreviews={true}
                                                    onChange={async (files) => {

                                                        this.setState({
                                                            files: files,
                                                        });
                                                        if (files.length > 0) {
                                                            const value = await this.getSchema(files);


                                                            this.setState({
                                                                schemaFieldDisable: true,
                                                                newGraph: {
                                                                    ...this.state.newGraph,
                                                                    schemaJson: value
                                                                },

                                                            })

                                                        } else {
                                                            this.setState({
                                                                schemaFieldDisable: false
                                                            })
                                                        }

                                                    }}


                                                    showPreviewsInDropzone={false}
                                                    useChipsForPreview
                                                    previewGridProps={{container: {spacing: 1, direction: 'row'}}}
                                                    previewChipProps={{classes: {root: this.classes.previewChip}}}
                                                    previewText="Selected files"
                                                    clearOnUnmount={true}
                                                    acceptedFiles={['application/json']}
                                                    filesLimit={1}
                                                />
                                            </DialogContent>


                                        </Dialog>


                                    </Grid>

                                    <Grid item xs={12}>

                                        <TextField
                                            style={{width: 400}}
                                            // disabled={this.state.schemaFieldDisable}
                                            value={this.state.newGraph.schemaJson}
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
                    style={{margin: 10}}
                    direction="row"
                    justify="center"
                    alignItems="center">
                    <Button onClick={()=>{
                        this.submitNewGraph();
                        this.setState({
                            files: [],
                            newGraph: {
                                ...this.state.newGraph,
                                graphId: "",
                                schemaJson:""



                            }
                        })


                    }
                    }
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
