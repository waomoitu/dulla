const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/qr', server);
app.use('/code', code);

app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html')
});

app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/index.html')
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'BWM XMD Session Scanner',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`
🚀 DULLAH XMD Scanner Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌐 Status: Online
📱 Service: Ready for sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

module.exports = app;
