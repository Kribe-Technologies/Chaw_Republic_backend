import { ErrorResponse } from '../utils/errorResponse.js';

function errorHandler(err, req, res, next) {
  let error = err;

  if (!(err instanceof ErrorResponse)) {
    error = new ErrorResponse(err.message || 'Internal Server Error', 500);
  }

  console.error(error.statusCode);
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode || 500,
      errors: 'errors' in error ? error.errors : null
    }
  });
};

export default errorHandler;