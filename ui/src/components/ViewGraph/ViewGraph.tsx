import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, IconButton, Toolbar ,Zoom} from '@material-ui/core'
import { Graph } from '../../domain/graph';
import { GetAllGraphsRepo } from '../../rest/repositories/get-all-graphs-repo';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined';
import { NotificationAlert, AlertType } from '../Errors/NotificationAlert';

interface IState {
    graphs: Graph[],
    selectedRow: any,
    errorMessage: string,
}

export default class ViewGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            selectedRow: '',
            errorMessage: '',
        }
    }

    public async componentDidMount() {
        try {
            const graphs: Graph[] = await new GetAllGraphsRepo().getAll();
            this.setState({ graphs })
        } catch (e) {
            this.setState({ errorMessage: `Failed to get all graphs: ${e.message}` });
        }
    }

    private classes: any = makeStyles({
        root: {
            width: '100%',
            marginTop: 40
        },
        table: {
            minWidth: 650,
        },
    });

    public render() {

        const { graphs, errorMessage } = this.state;

        return (
            <main style={{ marginTop: 30 }}>
                <Toolbar />
                <Grid container justify="center">
                    <Container component="main" maxWidth="sm">
                        {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                        <TableContainer>
                            <Table size='medium' className={this.classes.table} aria-label="Graphs Table" >

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
                                            <TableCell component="th" scope="row">{graph.getId()}</TableCell>
                                            <TableCell align="right">{graph.getStatus()}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip TransitionComponent={Zoom} title={`Delete ${graph.getId()}`}>
                                                    <IconButton>
                                                        <DeleteOutlineOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                {graphs.length === 0 && <caption>No Graphs. Add a graph or click Refresh if you have just deployed a Graph.</caption>}
                            </Table>
                        </TableContainer>
                        <Button
                            onClick={() => { }}
                            type="submit"
                            variant="outlined"
                            color="primary"
                            className={this.classes.submit}
                        >
                            <RefreshOutlinedIcon />Refresh Table
                        </Button>
                    </Container>
                </Grid>
            </main>
        );
    }
}
