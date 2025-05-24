import express, { Application } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './presentation/routes/user.routes.js';
import authRouter from './presentation/routes/auth.routes.js';
import riderRouter from './presentation/routes/rider.routes.js';
import restaurantAdminRouter from './presentation/routes/restaurantAdmin.routes.js';
import restaurantRouter from './presentation/routes/restaurant.routes.js';
import foodItemRouter from './presentation/routes/foodItem.routes.js';
import imageUploadRouter from './presentation/routes/imageUpload.route.js';

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

// auth routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/rider', riderRouter);
app.use('/restaurant-admin', restaurantAdminRouter);

// restaurant routes
app.use('/restaurant', restaurantRouter);
app.use('/food-item', foodItemRouter);

// file uploadin routes
app.use('/image',imageUploadRouter);



export default app;
