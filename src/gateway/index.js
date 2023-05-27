import { Connection, CloseCode } from "./connection.js";
import { isObject, tryParseJSON } from "../util.js";
import { PacketHandler } from "./packet.js";
import { Log } from "../logger.js";
import expressWs from "express-ws";
import express from "express";
import cl from "cli-color";

export class Gateway {
  /** @type {Set<Connection>} */
  connections = new Set();

  /** @param {import("../app").App} app */
  constructor(app) {
    this.router = express.Router();
    this.app = app;

    this.app.app.use("/gateway", this.router);
    this.router.ws("/", (ws, req) => {
      this.handleConnection(ws, req);
    });

    expressWs(this.router);
  }

  /**
   * @param {import("ws").WebSocket} ws
   * @param {import("express").Request} req
   */
  async handleConnection(ws, req) {
    const conn = new Connection(ws, req, this);
    Log.trace(`${cl.bold(conn.id)} - ${cl.blackBright(conn.ip)} connected to gateway`);

    ws.on("close", (code, reason) => {
      Log.trace(
        `${cl.bold(conn.id)} disconnected (${cl.yellow(
          code ?? "unknown code"
        )})`
      );
      this.connections.delete(conn);
    });

    ws.on("message", (raw) => {
      const packet = tryParseJSON(raw.toString());
      if (
        !isObject(packet)
        || !isObject(packet.data)
        || typeof packet.op != "number"
      ) {
        return ws.close(CloseCode.BadPacket);
      }

      PacketHandler.handle(conn, packet);
    });

    this.connections.add(conn);
  }
}