import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Toolbar } from '@material-ui/core'
import { Graph } from '../../domain/graph';
import { GetAllGraphsRepo } from '../../rest/repositories/get-all-graphs-repo';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
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
        let graphs: Graph[] = [];
        try {
            graphs = await new GetAllGraphsRepo().getAll();
        } catch (e) {
            this.setState({ errorMessage: `Failed to get all graphs: ${e.message}` });
        }
        this.setState({ graphs: graphs })
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

    private getStripedStyle = (index: any) => {
        return { background: index % 2 ? '#fafafa' : '#fafafa' };
    }

    public render() {

        const { graphs, errorMessage } = this.state;

        return (
            <main style={{ marginTop: 30 }}>
                <Toolbar />
                <Box width="50%" m="auto">
                    {errorMessage && <NotificationAlert alertType={AlertType.FAILED} message={errorMessage} />}
                    <TableContainer>
                        <Table className={this.classes.table} aria-label="simple table" >

                            <TableHead>
                                <TableRow style={{ background: '#F4F2F2' }}>
                                    <TableCell>Graph Name</TableCell>
                                    <TableCell align="right">Current State</TableCell>
                                    <TableCell align="right">Delete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {graphs.map((graph: Graph, index) => (
                                    <TableRow key={graph.getId()} hover role="checkbox"
                                        onClick={() => this.setState({ selectedRow: graph.getId() })} style={{ ...this.getStripedStyle(index) }}>

                                        <TableCell component="th" scope="row">{graph.getId()}</TableCell>
                                        <TableCell align="right">{graph.getStatus()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton>
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </main>
        );
    }
}
