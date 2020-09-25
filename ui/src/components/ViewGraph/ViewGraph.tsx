import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Button,
    Container,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Zoom,
} from '@material-ui/core';
import { Graph } from '../../domain/graph';
import { GetAllGraphsRepo } from '../../rest/repositories/get-all-graphs-repo';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import { AlertType, NotificationAlert } from '../Errors/NotificationAlert';
import { DeleteGraphRepo } from '../../rest/repositories/delete-graph-repo';

interface IState {
    graphs: Graph[];
    selectedRow: any;
    errorMessage: string;
}

export default class ViewGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            selectedRow: '',
            errorMessage: '',
        };
    }

    public async componentDidMount() {
        this.getGraphs();
    }

    private async getGraphs() {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            this.setState({ graphs });
        } catch (e) {
            this.setState({ errorMessage: `Failed to get all graphs: ${e.message}` });
        }
    }

    private async deleteGraph(graphName: string) {
        try {
            await new DeleteGraphRepo().delete(graphName);
            await this.getGraphs();
        } catch (e) {
            this.setState({ errorMessage: `Failed to delete graph "${graphName}": ${e.message}` });
        }
    }

    private classes: any = makeStyles({
        root: {
            width: '100%',
            marginTop: 40,
        },
        table: {
            minWidth: 650,
        },
    });

    public render() {
        const { graphs, errorMessage } = this.state;

        return (
            <main>
          
                {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                <Toolbar />
                <Grid container justify="center">
                    <Container component="main" maxWidth="sm">
                        
                        <TableContainer>
                            <Table size="medium" className={this.classes.table} aria-label="Graphs Table">
                                <TableHead>
                                    <TableRow style={{ background: '#F4F2F2' }}>
                                        <TableCell>Graph Name</TableCell>
                                        <TableCell align="right">Current State</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {graphs.map((graph: Graph, index) => (
                                        <TableRow key={graph.getId()} hover>
                                            <TableCell component="th" scope="row">
                                                {graph.getId()}
                                            </TableCell>
                                            <TableCell align="right">{graph.getStatus()}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip TransitionComponent={Zoom} title={`Delete ${graph.getId()}`}>
                                                    <IconButton
                                                        id={'view-graphs-delete-button-' + index}
                                                        onClick={
                                                            async () => {
                                                                await this.deleteGraph(graph.getId());
                                                            }
                                                        }
                                                    >
                                                        <DeleteOutlineOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                {graphs.length === 0 && <caption>No Graphs.</caption>}
                            </Table>
                        </TableContainer>
                        <Grid container style={{ margin: 10 }} direction="row" justify="center" alignItems="center">
                            <Button
                                id="view-graphs-refresh-button"
                                onClick={async () => await this.getGraphs()}
                                startIcon={<RefreshOutlinedIcon />}
                                variant="contained"
                                color="primary"
                                className={this.classes.submit}
                            >
                                Refresh Table
                            </Button>
                        </Grid>
                    </Container>
                </Grid>
            </main>
        );
    }
}
