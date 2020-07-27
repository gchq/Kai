const express = require('express');
//const dynamoDB = require('../../infrastructure/lib/database/graph-database');
// app
const app = express();
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/graphs', (req, res) => {
    //const table = dynamoDB.get();
    res.send([ {
        "graphId": "roadTraffic",
        "currentState": "DEPLOYED"
    }, {
        "graphId": "basicGraph",
        "currentState": "DELETION_QUEUED"
    }]);
    //res.send(table);
});

app.get('/graphs/:graphId', (req, res) => {
    res.send({
        "graphId": req.params.graphId,
        "currentState": "DEPLOYED"
    });
});
  
app.delete('/graphs/:graphId', (req, res) => {
    res.send({
        "graphId": req.params.graphId,
        "currentState": "DELETION_IN_PROGRESS"
    });
});
