import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@material-ui/core'
import { RestClient } from '../../rest/rest-client';
import { Graph } from '../../domain/graph';
import CreateGraph from "./CreateGraph";

interface IState {
    graphs: Graph[],
    selectedRow: any,
}

export default class ExampleTable extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            selectedRow: '',
        }
    }

    public async componentDidMount() {
        this.setState({
            graphs: await this.getGraphs(),
        })
    }
    
    private classes: any = makeStyles({
        table: {
            minWidth: 650,
        },
    });

    private async getGraphs() :Promise<Graph[]> {
        return RestClient.getAllGraphs();
    }
    
    private async deleteAndGetGraphs():Promise<Graph[]> {
        await RestClient.deleteGraphById(this.state.selectedRow);
        return await this.getGraphs();
    }

    public render() {
        return (
            <Box>
                <TableContainer>
                    <Table className={this.classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>

                                <TableCell>Graph ID</TableCell>
                                <TableCell align="right">Current State</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.graphs.map((graph: Graph) => (
                                <TableRow key={graph.getId()} hover role="checkbox"
                                        onClick={() => this.setState({selectedRow: graph.getId()})}>

                                    <TableCell component="th" scope="row">{graph.getId()}</TableCell>
                                    <TableCell align="right">{graph.getStatus()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>


                </TableContainer>
                <Box display="flex" justifyContent="center" style={{marginTop: 20}}>
                    <Button variant="outlined" color="primary" onClick={() => this.deleteAndGetGraphs()} style={{margin: "10px"}}>
                        Delete Graph
                    </Button>
                    <CreateGraph />
                </Box>
            </Box>

        ); 
    }
}
