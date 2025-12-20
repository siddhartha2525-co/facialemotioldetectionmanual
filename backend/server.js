const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const socketService = require('./src/services/socketService');

const server = http.createServer(app);

// Initialize Socket.IO and get state
const { studentMap, classAggregators, activeClasses } = socketService.init(server);

// Setup Express routes with access to socket state
app.setupRoutes(studentMap, classAggregators, activeClasses);

// Add health check here as well in case /api prefix issues
app.get('/health', (req, res) => res.json({ success: true }));

server.listen(config.PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${config.PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});