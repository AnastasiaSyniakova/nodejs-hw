import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import pinoHttp from 'pino-http';

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.get('/notes', (_req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((error, req, res, _next) => {
  req.log.error(error);

  res.status(500).json({
    message: error.message,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
