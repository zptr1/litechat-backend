import { getRequestIP } from "../util.js";
import { randomBytes } from "crypto";

export const CloseCode = {
  BadPacket: 3000,
  InvalidOpcode: 3001,
  Unauthorized: 3002,
  TimedOut: 3003,
};

export class Connection {
  /**
   * @param {import("ws").WebSocket} ws
   * @param {import("express").Request} req
   * @param {import(".").Gateway} gateway
   */
  constructor(ws, req, gateway) {
    this.ws = ws;
    this.req = req;
    this.gateway = gateway;

    this.id = randomBytes(4).toString("hex");
    this.ip = getRequestIP(req);

    this.user = null;
    this.lastHeartbeatAt = Date.now();
  }

  send(op, data) {
    this.ws.send(
      JSON.stringify({
        op,
        data,
      })
    );
  }
}
