const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { startEventReminderService } = require('./services/eventReminderService');
const { startMatterReminderService } = require('./services/matterReminderService');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Render proxy for cookies


// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, '')) // Remove trailing slashes
    .filter(Boolean);


const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    // Normalize incoming origin
    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) return true;

    return allowedOrigins.some((allowedOrigin) => {
        if (!allowedOrigin.includes('*')) return false;
        const pattern = new RegExp(`^${allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
        return pattern.test(normalizedOrigin);
    });
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/matters', require('./routes/matterRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/communications', require('./routes/communicationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/', (req, res) => res.send('CRM API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startEventReminderService();
    startMatterReminderService();
});
