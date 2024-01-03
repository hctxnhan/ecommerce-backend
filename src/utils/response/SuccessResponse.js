export default class SuccessResponse {
  constructor({ status, message, data, metadata }) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.metadata = metadata;
  }

  send(res) {
    res.status(this.status).json(this);
  }
}
