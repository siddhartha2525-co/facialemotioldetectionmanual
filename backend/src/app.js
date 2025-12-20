const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

app.use(express.json({ limit: '12mb' }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// MongoDB Connection
if (config.MONGO_URI) {
    mongoose
        .connect(config.MONGO_URI)
        .then(() => console.log("✅ MongoDB connected"))
        .catch(err => console.error("❌ MongoDB connection error:", err.message));
} else {
    console.warn("⚠️ No MONGO_URI provided — Database disabled");
}

// Routes
const { router, initRoutes } = require('./routes/api');
// We will call initRoutes using the socket service state in server.js
// But for now, we can just export a function to attaching routes
app.setupRoutes = (studentMap, classAggregators, activeClasses) => {
    app.use('/api', initRoutes(studentMap, classAggregators, activeClasses));
};

module.exports = app;
