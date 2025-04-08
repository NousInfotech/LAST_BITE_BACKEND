import express, { Application } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './presentation/routes/user.routes.js';

const app: Application = express();

// Basic middlewares
app.use(helmet());                  // Secure HTTP headers
app.use(cors({                      // Enable CORS
    origin: "*",
    credentials: true,
}));
app.use(morgan('dev'));             // Logging
app.use(express.json());            // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());            // Parse cookies

// Routes 

app.use('/user', userRouter);

export default app;
