const mongoose = require('mongoose');
const config = require('config');
const dbgr = require('debug')("development:mongoose");

// Connection string should be pulled from your configuration
const connectionString = `${config.get("MONGODB_URI")}/shopify`;

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => dbgr("Connected to MongoDB"))
.catch((err) => dbgr("Error connecting to MongoDB:", err));

module.exports = mongoose.connection;
