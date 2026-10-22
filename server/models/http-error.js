class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.statusCode = errorCode;
  }
}

export default HttpError;
