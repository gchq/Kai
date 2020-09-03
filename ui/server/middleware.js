const express = require('express');

// app
const app = express();
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// Get all graphs
app.get('/graphs', (req, res) => {
    res.send([ {
        "graphName": "roadTraffic",
        "currentState": "DEPLOYED"
    }, {
        "graphName": "basicGraph",
        "currentState": "DEPLOYED"
    }]);
});

// Get graph by ID
app.get('/graphs/:graphName', (req, res) => {
    res.send({
        "graphName": req.params.graphName,
        "currentState": "DEPLOYED"
    });
});

// Delete graph by ID
app.delete('/graphs/:graphName', (req, res) => {
    res.status(202).end();
});

//Create Graph
app.post('/graphs', (req,res) =>{
    res.status(201).end();
});
