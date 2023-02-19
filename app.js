require("dotenv").config()
const express = require("express")
const app = express()

// Require morgan and body-parser middleware
const morgan = require('morgan');

// Have the server use morgan with setting 'dev'
app.use(morgan('dev'))
app.use(express.json())

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Import cors 
// Have the server use cors()
const cors = require('cors');

app.use(cors());

// Have the server use your api router with prefix '/api'
const router = require('./api');
app.use('/api', router);

// Import the client from your db/index.js
const client = require('./db/client');
client.connect();

// Create custom 404 handler that sets the status code to 404.
app.use('*',(req, res) => {
    res.status(404).send({ message: '404 Not Found' })
})

module.exports = app;
