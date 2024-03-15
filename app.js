const express = require('express');
var cors = require('cors')

const app = express();
app.use(cors())

const PORT = process.env.PORT || 2005;
const mongoose = require('mongoose');
require('dotenv').config()


const bodyParser = require('body-parser');
app.use(bodyParser.json());

//database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }, () => { // Added options to the mongoose connection
    console.log('database connected');
});

app.get('/', (req, res) => {
    res.send('Hello');
});

//import routes
const userRoutes = require('./routes/users');
app.use('/user',userRoutes)

const listingRoutes = require('./routes/listings');
app.use('/listing',listingRoutes)

//middleware
app.use(express.static('public'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

