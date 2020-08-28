import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import { Grid, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Toolbar } from '@material-ui/core'
import { Graph } from '../../domain/graph';
import { DeleteGraphRepo } from '../../rest/repositories/delete-graph-repo';
import { GetAllGraphsRepo } from '../../rest/repositories/get-all-graphs-repo';
import CreateIcon from '@material-ui/icons/Create';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

interface IState {
    graphs: Graph[],
    selectedRow: any,
}

export default class ViewGraph extends React.Component<{}, IState> {
    constructor(props: Object) {
        super(props);
        this.state = {
            graphs: [],
            selectedRow: '',
        }
    }

    public async componentDidMount() {
        try {
            this.setState({ graphs: await new GetAllGraphsRepo().getAll() });
        } catch (e) {
            console.log(e.message);
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

    private getStripedStyle = (index:any) => {
        return { background: index % 2 ? '#fafafa' : '#fafafa' };
    }

    public render() {
        return (
           <main style={{marginTop:30}}>
               <Toolbar />
                <Box width="50%" m="auto">
                    <TableContainer>
                        <Table className={this.classes.table} aria-label="simple table" >
                    
                            <TableHead>
                                <TableRow style = {{background: '#F4F2F2'}}>
                                    <TableCell>Graph Name </TableCell>
                                    <TableCell align="right">Current State</TableCell>
                                    <TableCell align="right">Update</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            
                                {this.state.graphs.map((graph: Graph, index) => (
                                    <TableRow key={graph.getId()} hover role="checkbox"
                                            onClick={() => this.setState({selectedRow: graph.getId()})} style = {{ ...this.getStripedStyle(index)}}>

                                        <TableCell component="th" scope="row">{graph.getId()}</TableCell>
                                        <TableCell align="right">{graph.getStatus()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton>
                                                <CreateIcon/>
                                            </IconButton>
                                            <IconButton>
                                                <DeleteOutlineOutlinedIcon/>
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
