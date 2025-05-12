// api/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppError } from '../src/utils/appError.js';
import { globalError } from '../src/middlewares/globalError.js';
import { bootstrap } from '../src/Modules/bootstrap.js';
import { dbConnection } from '../DB/db.connection.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

bootstrap(app);

app.use((req, res, next) => {
  next(new AppError(`route not found ${req.originalUrl}`, 404));
});

app.use(globalError);

// أهم سطر: بدل `app.listen`, نستخدم handler مناسب لـ Vercel
export default app;
