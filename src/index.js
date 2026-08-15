import express from 'express';
import http from 'http';
import { matchesRouter } from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js';
import { commentoryRouter } from './routes/commentory.js';

const app = express();
const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;

const server = http.createServer(app);

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root GET route returning a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

app.use('/matches', matchesRouter); // Use the matches router for /matches endpoint 
app.use('/matches/:id/commentory', commentoryRouter);

const { broadcastMatchCreate, broadcastCommentary } = attachWebSocketServer(server);
app.locals.broadcastMatchCreate = broadcastMatchCreate; // Store the broadcast function in app locals for later use
app.locals.broadcastCommentary = broadcastCommentary;

// Start the server and log the URL
server.listen(PORT, HOST, () => {
  const baseUrl = `http://${HOST}:${PORT}`;
  console.log(`Server is running on base URL: ${baseUrl}`);
  console.log(`WebSocket server is running on ws://${HOST}:${PORT}/ws`);
});
