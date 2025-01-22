import express from 'express';
import { login, register, resendOTP, verifyOTP, forgetPassword, resetPassword } from '../controllers/customer.js';
import env from '../config/env.js';
import upload from '../utils/multer.js';
import { ErrorResponse } from '../utils/errorResponse.js';
// import cache from '../middlewares/cache';

export const route = express.Router();

if (!env.CACHEKEY) {
  throw new ErrorResponse("Cache unique key is required", 500);
  
}
route.post('/register', register);
route.post('/login', login);
route.route('/otp/:id')
  .put(resendOTP)
  .post(verifyOTP)
route.post('/forget-password', forgetPassword);
route.put('/reset/:token', resetPassword);

export default route;