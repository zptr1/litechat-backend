export class APIError extends Error {
  /** @type {number} */
  HTTP_CODE;
  /** @type {string} */
  CODE;

  constructor (data={}) {
    super();
    this.data = data;
  }
}

export class UnauthorizedError extends APIError {
  HTTP_CODE = 401;
  CODE = "UNAUTHORIZED";
}

export class InvalidUsernameOrPasswordError extends APIError {
  HTTP_CODE = 401;
  CODE = "INVALID_USERNAME_OR_PASSWORD";
}

export class InvalidPasswordError extends APIError {
  HTTP_CODE = 401;
  CODE = "INVALID_PASSWORD";
}

export class NotFoundError extends APIError {
  HTTP_CODE = 404;
  CODE = "NOT_FOUND";
}

export class UsernameTakenError extends APIError {
  HTTP_CODE = 409;
  CODE = "USERNAME_TAKEN";
}