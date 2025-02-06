import express from 'express';
import { login, register, resendOTP, verifyOTP, forgetPassword, resetPassword } from '../controllers/vendor.js';
import upload from '../utils/multer.js';

const route = express.Router();

route.post('/register', register);
route.post('/login', login);
route.route('/otp/:id')
  .put(resendOTP)
  .post(verifyOTP)

route.post('/forget-password', forgetPassword);
route.put('/reset/:resetToken', resetPassword);

export default route;