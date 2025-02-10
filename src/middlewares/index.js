import Customer from '../models/customer.js';
import asyncHandler from './async.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import Vendor from '../models/vendor.js';
import { verifyToken } from '../utils/jwt.js';

// Constants for authentication
const AUTH_CONSTANTS = {
  BEARER_PREFIX: 'Bearer ',
  COOKIE_NAME: 'token',
  ERROR_MESSAGES: {
    TOKEN_MISSING: 'Authentication token is required',
    USER_NOT_FOUND: 'User not found or session expired',
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid authentication token',
    TOKEN_EXPIRED: 'Token has expired',
    AUTH_FAILED: 'Authentication failed'
  }
};

/**
 * Extracts token from request headers or cookies
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) throw new ErrorResponse('No token found', 401)
  
  if (authHeader?.startsWith(AUTH_CONSTANTS.BEARER_PREFIX)) {
    return authHeader.substring(AUTH_CONSTANTS.BEARER_PREFIX.length);
  }
  
  return req.cookies[AUTH_CONSTANTS.COOKIE_NAME] || null;
};

/**
 * Authentication middleware
 */

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ErrorResponse(AUTH_CONSTANTS.ERROR_MESSAGES.TOKEN_MISSING, 401);
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    throw next(new ErrorResponse(AUTH_CONSTANTS.ERROR_MESSAGES.TOKEN_EXPIRED, 401));
  }

  // Check for the user in each model
  let user = await Customer.getCustomerByToken(token);
  if (user) {
    req.customer = user;
    return next();
  }

  user = await Vendor.getVendorByToken(token);
  if (user) {
    req.vendor = user; 
    return next();
  }

  // If no user is found
  throw new ErrorResponse(AUTH_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND, 401);
});

/**
 * Resource ownership middleware 
 */
export const isOwner = asyncHandler(async (req, res, next) => {
  const { id } = req.params; 
  const currentUserId = req.customer?.id || req.vendor?.id;

  if (!id) throw next(new ErrorResponse('Id is required in params', 401));

  if (!currentUserId) {
    throw next(new ErrorResponse(AUTH_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED, 401));
  }

  // Use strict equality comparison with toString()
  if (currentUserId.toString() !== id.toString()) {
    throw next(new ErrorResponse(AUTH_CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED, 403));
  }

  next();
});