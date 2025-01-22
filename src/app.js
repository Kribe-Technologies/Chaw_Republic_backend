import express from "express";
import asyncHandler from "./middlewares/async.js";
import errorHandler from "./middlewares/error.js";
import { AppResponse } from "./utils/appResponse.js";
import cors from 'cors';
import session from "express-session";
import environment from './config/env.js';
import { ErrorResponse } from "./utils/errorResponse.js";
import customerRoute from './routes/customer.js';
import vendorRoute from './routes/vendor.js';
import upload from "./utils/multer.js";

const app = express();

if (!environment.SESSION_SECRET) {
  throw new ErrorResponse('Secret key is required', 500);
}

app.use(express.json());
app.use(cors({ credentials: true }));
app.use(express.urlencoded({ extended: true })); 
app.use(upload.any()); 
app.use(session({ secret: environment.SESSION_SECRET, resave: false, saveUninitialized: true }));

app.get('/', asyncHandler(async (req, res) => {
  return AppResponse(res, 200, null, 'Welcome');
}));

app.use('/api/v1/customer', customerRoute);
app.use('/api/v1/vendor', vendorRoute);

// Catch-all route for undefined routes
app.all('*', (req, res, next) => {
  const error = new ErrorResponse('Route not found. Check url or method', 404);
  next(error); 
});

app.use(errorHandler);

export default app;
