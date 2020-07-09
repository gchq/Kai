const express = require('express');

// app
const app = express();
const port = process.env.PORT || 5000;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/graph', (req, res) => {
  res.send([
    {graphId: 'KORAT', status: 'Feeling cute'}
  ]);
});
