const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const os = require('os');

// Configurar zona horaria para Bogotá (America/Bogota = UTC-5)
process.env.TZ = 'America/Bogota';

// Load env vars
dotenv.config();

// Log zona horaria configurada
console.log('✓ Zona horaria configurada:', process.env.TZ, '(UTC-5)');

// Initialize SQLite database (schema auto-created)
require('./database/connection');
console.log('SQLite Connected: database.sqlite');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const saleRoutes = require('./src/routes/saleRoutes');
const registerRoutes = require('./src/routes/registerRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const backupRoutes = require('./src/routes/backupRoutes');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/registers', registerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/transfers', require('./src/routes/transferRoutes'));
app.use('/api/backups', backupRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

// Get local IP address
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n========================================');
    console.log('Backend API Iniciado');
    console.log('========================================');
    console.log(`Local:        http://localhost:${PORT}`);
    console.log(`Red Local:    http://${localIP}:${PORT}`);
    console.log('========================================\n');
});
