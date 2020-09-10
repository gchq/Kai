import React from 'react';
import { Button, Container, CssBaseline, Dialog, DialogContent, Grid, IconButton, makeStyles, Slide, TextField } from '@material-ui/core';
import { Schema } from '../../domain/schema';
import { Notifications } from '../../domain/notifications';
import { CreateGraphRepo } from '../../rest/repositories/create-graph-repo';
import { Alert } from '@material-ui/lab';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { DropzoneArea } from 'material-ui-dropzone';
import ClearIcon from '@material-ui/icons/Clear';
import { TransitionProps } from '@material-ui/core/transitions';
import Toolbar from '@material-ui/core/Toolbar';
import { AlertType, NotificationAlert } from '../Errors/NotificationAlert';

interface IState {
    dialogIsOpen: boolean;
    files: Array<File>;
    schemaFieldDisable: boolean;
    newGraph: {
        graphName: string;
        administrators: Array<string>;
        schemaJson: string;
    };
    outcome: AlertType | undefined;
    outcomeMessage: string;
    errors: Notifications;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
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
                graphName: '',
                administrators: [],
                schemaJson: '',
            },
            outcome: undefined,
            outcomeMessage: '',
            errors: new Notifications(),
        };
    }

    private async submitNewGraph() {
        const { graphName, administrators, schemaJson } = this.state.newGraph;
        const errors: Notifications = new Notifications();
        if (graphName.length === 0) {
            errors.addError('Graph Name is empty');
        }

        const schema = new Schema(schemaJson);
        const schemaErrors: Notifications = schema.validation();
        errors.concat(schemaErrors);

        if (errors.isEmpty()) {
            try {
                await new CreateGraphRepo().create(graphName, administrators, schema);
                this.setState({ outcome: AlertType.SUCCESS, outcomeMessage: `${graphName} was successfully added` });
            } catch (e) {
                this.setState({ outcome: AlertType.FAILED, outcomeMessage: `Failed to Add '${graphName}' Graph: ${e.message}` });
            }
        } else {
            this.setState({ errors: errors });
        }
    }

    private async getSchema(files: Array<File>) {
        return await files[0].text();
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
                <Grid style={{ marginTop: 30 }} container justify="center">
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        {this.state.outcome && <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />}
                        {!this.state.errors.isEmpty() && (
                            <Alert variant="outlined" severity="error">Error(s): {this.state.errors.errorMessage()}</Alert>
                        )}
                        <div className={this.classes.paper}>
                            <form className={this.classes.form} noValidate>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            value={this.state.newGraph.graphName}
                                            required
                                            fullWidth
                                            id="graphName"
                                            label="Graph Name"
                                            name="graphName"
                                            autoComplete="graph-name"
                                            onChange={(event) => {
                                                this.setState({
                                                    newGraph: {
                                                        ...this.state.newGraph,
                                                        graphName: event.target.value,
                                                    },
                                                });
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} container direction="row" justify="flex-end" alignItems="center">
                                        <IconButton onClick={openDialogBox}>
                                            <InsertDriveFileOutlinedIcon />
                                        </IconButton>

                                        <Dialog
                                            open={this.state.dialogIsOpen}
                                            TransitionComponent={Transition}
                                            keepMounted
                                            onClose={closeDialogBox}
                                            style={{ minWidth: '500px' }}
                                            aria-labelledby="alert-dialog-slide-title"
                                            aria-describedby="alert-dialog-slide-description"
                                        >
                                            <Grid container direction="row" justify="flex-end" alignItems="flex-start">
                                                <IconButton onClick={closeDialogBox}>
                                                    <ClearIcon />
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
                                                                    schemaJson: value,
                                                                },
                                                            });
                                                        } else {
                                                            this.setState({
                                                                schemaFieldDisable: false,
                                                            });
                                                        }
                                                    }}
                                                    showPreviewsInDropzone={false}
                                                    useChipsForPreview
                                                    previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                                                    previewChipProps={{ classes: { root: this.classes.previewChip } }}
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
                                            style={{ width: 400 }}
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
                                                        schemaJson: event.target.value,
                                                    },
                                                });
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                    <Button
                        onClick={() => {
                            this.submitNewGraph();
                            this.setState({
                                files: [],
                                newGraph: {
                                    ...this.state.newGraph,
                                    graphName: '',
                                    schemaJson: '',
                                },
                            });
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
        );
    }

    private classes: any = makeStyles((theme) => ({
        root: {
            width: '100%',
            marginTop: 40,
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
            margin: '10px',
        },
        previewChip: {
            minWidth: 160,
            maxWidth: 210,
        },
    }));
}
