import { getRequestIP } from "./util";
import { randomBytes } from "crypto";

export class Connection {
  /**
   * @param {import("ws").WebSocket} ws 
   * @param {import("express").Request} req 
   */
  constructor (ws, req) {
    this.ws = ws;
    this.req = req;
    this.id = randomBytes(4).toString("hex");
    this.ip = getRequestIP(req);
  }

  async initialize() {

  }
}