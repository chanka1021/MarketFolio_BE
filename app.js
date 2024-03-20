const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 2005;
const mongoose = require('mongoose');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Connect to the database
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('Database connected');
});

// Root route
app.get('/', (req, res) => {
    res.send('Hello what are you looking for 🤨 ? ');
});

// Import user routes
const userRoutes = require('./routes/users');
app.use('/user', userRoutes);

// Import listing routes
const listingRoutes = require('./routes/listings');
app.use('/listing', listingRoutes);

// Middleware for serving static files
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
