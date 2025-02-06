import asyncHandler from "../middlewares/async.js";
import { CustomerRepository } from "../repository/customer.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { comparePassword, compareToken, hashToken } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { loginUser, resetLink, resetPass, updatePass, verifyOTPInput } from "../validators/index.js";
import crypto from 'crypto';
import { sendOTP, sendResetLink } from "../utils/sendEmail.js";
import { registerCustomer } from "../validators/customer.js";
import { AppResponse } from "../utils/appResponse.js";

export const register = asyncHandler(async (req, res, next) => {
  const { error, value } = registerCustomer.validate(req.body);

  if (error) {
    console.error(error.message);
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { email, ...data } = value;

  // Check all collections for existing email
  const customerExists = await CustomerRepository.getCustomerByEmail(email);

  if (customerExists) {
    console.error('Customer Already Exists');
    throw next(new ErrorResponse('Customer already exists', 409));
  }

  const newCustomer = await CustomerRepository.createCustomer(value);

  const sent = await sendOTP(newCustomer.otp, email)

  console.log(newCustomer.otp);

  return AppResponse(res, 201, newCustomer.customer, "Customer registered. Please verify OTP to complete registration.")
});

export const login = asyncHandler(async (req, res, next) => {
  const { error, value } = loginUser.validate(req.body);

  if (error) {
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { email, password } = value;

  const customer = await CustomerRepository.getCustomerByEmail(email);

  if (!customer || !customer.password) {
    throw next(new ErrorResponse('Invalid credentials', 401));
  }

  const compare = await comparePassword(password, customer.password);

  if (!compare) {
    throw next(new ErrorResponse('Invalid credentials', 401));
  }

  const token = await generateToken(email);
  customer.token = token;
  await customer.save();

  return AppResponse(res, 200, customer, 'Customer has successfully logged in')
});

export const resendOTP = asyncHandler(async (req, res, next) => {
  const customerId = req.params.id;

  // Check all collections for the customer
  const customer = await CustomerRepository.getCustomerById(customerId);

  if (!customer) {
    console.error("Customer not found");
    throw next(new ErrorResponse("Customer not found", 404));
  }

  // Generate a new OTP
  const newOTP = Array(6).fill(0).map(() => Math.floor(Math.random() * 10)).join("");

  const hashedOTP = crypto.createHash("sha256").update(newOTP).digest("hex");
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // New expiration time: 10 minutes

  // Update customer with new OTP and expiry
  customer.otp = hashedOTP;
  customer.otpExpires = expiry;
  await customer.save();

  const sent = await sendOTP(newOTP, customer.email);

  console.log(newOTP);

  // Respond with success 
  return AppResponse(res, 200, customer, "New OTP has been sent")
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const customerId = req.params.id;

  const { error, value } = verifyOTPInput.validate(req.body);
  if (error) {
    console.error(error.message);
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { otp } = value;

  // Check customer collection for the customer
  const customer = await CustomerRepository.getCustomerById(customerId);

  if (!customer) {
    console.error("customer not found");
    throw next(new ErrorResponse("customer not found", 404));
  }

  // Check if OTP has expired
  if (!customer.otpExpires || customer.otpExpires.getTime() < Date.now()) {
    console.error("OTP has expired");
    throw next(new ErrorResponse("OTP has expired", 400));
  }

  // Hash the provided OTP
  const hashedOTP = crypto.createHash("sha256").update(String(otp)).digest("hex");

  // Compare the hashed OTP with the stored OTP
  console.log(hashedOTP)
  console.log(customer.otp)
  // console.log(customer[otp])
  if (customer.otp !== hashedOTP) {
    console.error("Invalid OTP");
    throw next(new ErrorResponse("Invalid OTP", 400));
  }

  // Mark the customer as verified
  customer.isVerified = true;
  customer.otp = undefined; // Clear the OTP
  customer.otpExpires = undefined; // Clear OTP expiry
  await customer.save();

  return AppResponse(res, 200, customer, "OTP verified successfully")
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { error, value } = resetLink.validate(req.body); 

  if (error) {
    console.error(error.message);
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { email } = value;

  const exists = await CustomerRepository.getCustomerByEmail(email);
  console.log(exists);
  
  if (!exists) {
    throw next( new ErrorResponse("This customer doesn't exists", 404));
  }

  const resetToken = await generateToken(email);
  const expiry = new Date(Date.now() + 1 *60 * 60 * 1000); // New expiration time: 1 hour

  const hashedToken = await hashToken(resetToken);
  console.log(hashedToken)

  exists.resetToken = hashedToken;
  exists.resetTokenExpires = expiry;
  await exists.save();

  const sendMail = await sendResetLink(resetToken, email, 'customer');

  return AppResponse(res, 200, resetToken, 'Reset link has been sent');
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    console.error('Token is required');
    throw next(new ErrorResponse("Reset Token is required", 401));
  }

  const { error, value } = resetPass.validate(req.body);

  if (error) {
    console.error(error.message);
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { id, newPassword, confirmPassword } = value;

  if (confirmPassword !== newPassword) {
    throw next(new ErrorResponse("Passwords don't match", 400));
  }

  const user = await CustomerRepository.getCustomerById(id);

  console.log(user)

  if (!user || !user.resetToken) {
    throw next(new ErrorResponse('No user found', 404));
  }

  // Check if token has expired
  if (!user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
    console.error("Reset token has expired");
    throw next(new ErrorResponse("Reset token has expired", 402));
  }

  const hashedToken = await compareToken(token, user.resetToken)
  console.log(hashedToken);

  const update = await CustomerRepository.updateCustomerPassword(user.id, newPassword);

  return AppResponse(res, 200, null, 'Password has been updated')
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const id = req.customer?.id;

  const { error, value } = updatePass.validate(req.body);

  if (error) {
    throw next(new ErrorResponse(error.details[0].message, 400));
  }

  const { oldPassword, newPassword, confirmPassword } = value;

  const user = await CustomerRepository.getCustomerById(id);
  console.log(user);

  if (!user || !user.password) {
    throw next(new ErrorResponse('User password not found', 404));
  }

  const compare = await comparePassword(oldPassword, user.password);

  if (!compare) {
    throw next(new ErrorResponse('Invalid password', 400));
  }

  if (confirmPassword !== newPassword) {
    throw next(new ErrorResponse("Passwords don't match", 400));
  }

  const update = await CustomerRepository.updateCustomerPassword(id, newPassword);
  
  return AppResponse(res, 200, null, 'Password has been updated');
});