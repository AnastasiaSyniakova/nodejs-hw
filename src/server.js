import cors from 'cors';
import { errors } from 'celebrate';
import 'dotenv/config';
import express from 'express';

import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

app.use(logger);
app.use(express.json());
app.use(cors());

app.use(notesRoutes);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
