const express = require('express');
const app = express();
const port = 3000;
const schedulerRouter = require('./src/rest-api/scheduler');

app.use('/api/scheduler', schedulerRouter);

//To create a listener to a separated port
app.listen(port, () => {
   console.log(`google-calender-scheduler server is running at http://localhost:${port}`);
});

