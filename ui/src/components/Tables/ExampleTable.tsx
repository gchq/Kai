import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Container, Box} from '@material-ui/core'
import { purple } from '@material-ui/core/colors';



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
var rows = generateData();
function deleteData (graphId: any){
  var request = new XMLHttpRequest();
      request.open('DELETE','/graphs/:'+graphId, false);  // `false` makes the request synchronous
      request.send(null);
  
      if (request.status === 200) {
        return JSON.parse(request.responseText);
      }

}
 

function updateData(graphId:any){
  rows=[];
  var data= getData()
  var newRow= deleteData(graphId)

  for (var row in data){
    var currentRow= data[row]
    if (currentRow.graphId != graphId){
      rows.push(createData(currentRow.graphId, currentRow.currentState))

    }
    else{
      console.log(22)
      
      rows.push(createData(newRow.graphId,newRow.currentState))
    }
  
    
    
  }
  console.log(rows)

  
}






export default function ExampleTable() {
  const classes = useStyles();
  var selectedRow ="";
  function getSelectedRow(rows: any){
    selectedRow= rows.graphId;
  }

  return (
    <Box >
    <TableContainer >
      <Table className={classes.table} aria-label="simple table" >
        <TableHead>
          <TableRow >

            <TableCell>Graph ID</TableCell>
            <TableCell align="right">Current State</TableCell>

          </TableRow>
        </TableHead>
        <TableBody >
          {rows.map((row) => (
            <TableRow key={row.graphId} hover role="checkbox" 
            onClick={() => selectedRow=row.graphId
            } >

              <TableCell component="th" scope="row">
                {row.graphId}
              </TableCell>
              <TableCell align="right">{row.currentState}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      
    </TableContainer>
    <Box display="flex" justifyContent="center" style={{marginTop: 20}}>
    <Button  variant="contained" color="primary" onClick={()=>console.log(updateData(selectedRow)) }>
        Delete Graph
    </Button>
    </Box>
    </Box>

  );
}
