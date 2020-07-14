import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@material-ui/core'


const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function getData(){
  var request = new XMLHttpRequest();
      request.open('GET', '/graphs', false);  // `false` makes the request synchronous
      request.send(null);
  
      if (request.status === 200) {
        return JSON.parse(request.responseText);
      }
}
function createData(graphId: any, currentState: any) {
  return { graphId, currentState};
}



function generateData(){
  var data = getData();
			var rows = []
			for(var row in data){
				var currentRow = data[row];
				rows.push(createData(currentRow.graphId, currentRow.currentState))
			}
			return rows
}
const rows = generateData();

export default function ExampleTable() {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Graph ID</TableCell>
            <TableCell align="right">Current State</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.graphId}>
              <TableCell component="th" scope="row">
                {row.graphId}
              </TableCell>
              <TableCell align="right">{row.currentState}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
