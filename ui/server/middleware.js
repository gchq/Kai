const express = require('express');

// app
const app = express();
const port = process.env.PORT || 5000;
let graphs = [];

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// Get all graphs
app.get('/graphs', (req, res) => {
    res.send([ {
        "graphId": "roadTraffic",
        "currentState": "DEPLOYED"
    }, {
        "graphId": "basicGraph",
        "currentState": "DEPLOYED"
    }]);
});

// Get graph by ID
app.get('/graphs/:graphId', (req, res) => {
    res.send({
        "graphId": req.params.graphId,
        "currentState": "DEPLOYED"
    });
});

// Delete graph by ID
app.delete('/graphs/:graphId', (req, res) => {
    res.send({
        "graphId": req.params.graphId,
        "currentState": "DELETION_IN_PROGRESS"
    });
});
//Create Graph
app.post('/graphs', (req,res) =>{

    res.status(201).end();
});
