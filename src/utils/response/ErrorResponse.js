export default class ErrorResponse {
  constructor({ status, message, errors }) {
    this.status = status;
    this.message = message;
    this.errors = errors;
  }

  send(res) {
    res.status(this.status).json(this);
  }
}
