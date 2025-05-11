import cors from 'cors';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import config from './configs/config.js';
import instanceMongodb from './db/mongo.connection.js';
import registerRoutes from './routes/index.js';
import GeminiRoutes from './modules/gemini/routes/index.js';
import { registerKeywordToolRoutes } from './keyword-tools/routes/index.js';
import LanguageMiddleware from './middleware/language.middleware.js';
import redisServiceIntance from './services/redis.service.js';

import multer from 'multer';
import MediaUploadService from './services/media-upload.service.js';

// Initialize app
const app = express();

app.use(
  cors({
    origin: '*',
  })
);

// Middleware configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use('/images', express.static('src/uploads/'));
app.use(LanguageMiddleware);

// Routes configuration
registerRoutes(app);
registerKeywordToolRoutes(app);
app.use('/api/geminis', GeminiRoutes);

// Media upload routes
const mediaUploadService = new MediaUploadService();
app.post('/admin-api/api/upload', upload.single('file'), mediaUploadService.uploadImageTemp);
// Multiple files upload endpoint (using the same handler)
app.post('/admin-api/api/upload/multiple', upload.array('files', 10), mediaUploadService.uploadMultipleImagesTemp);

const PORT = config.app.port || 3000;
app.listen(PORT, () => {
});
