import express from 'express';
import { matchesRouter } from './routes/matches.js';
const app = express();
const PORT = 8000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Root GET route returning a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Express server!' });
});

app.use('/matches', matchesRouter); // Use the matches router for /matches endpoint 

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
