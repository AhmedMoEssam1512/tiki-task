require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const logger = require("./config/logger");
const sequelize = require("./config/database");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✅ Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ✅ Start server only after DB sync
sequelize.sync({ alter: true })
    .then(() => {
        logger.info('✅ Database synced');
        app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        logger.error('❌ Failed to sync DB:', err);
});



// ✅ Global error handler
app.use((error, req, res, next) => {
    if (error.name === "ValidationError") {
        error.statusMessage = "Error";
        error.statusCode = 400;
        error.message = "Invalid email format";
    }

    if (res.headersSent) {
        if (req.headers.accept === "text/event-stream") {
            res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
            return res.end();
        }
        return res.end();
    }

    res.status(error.statusCode || 400).json({
        status: error.statusMessage || "Error",
        data: { message: error.message }
    });
});