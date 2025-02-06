
export class ErrorResponse extends Error {
  statusCode;
  errors;

  constructor(message, statusCode, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this,ErrorResponse.prototype)
  }
}