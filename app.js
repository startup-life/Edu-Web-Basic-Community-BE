require('dotenv').config({ path: './.env.dev' });

const express = require('express');
const routes = require('./route/index.js');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

app.use(cors('*'));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});