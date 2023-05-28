import { Log, isObject, tryParseJSON } from "../util/index.js";
import { Connection, CloseCode } from "./connection.js";
import { PacketHandler } from "./packet.js";
import expressWs from "express-ws";
import express from "express";
import cl from "cli-color";

export class Gateway {
  /** @type {Set<Connection>} */
  static connections = new Set();

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
    
    Log.trace(
      `[GATEWAY] ${cl.bold(conn.id)} (${cl.blackBright(conn.ip)}) connected`
    );

    ws.on("close", (code, reason) => {
      Log.trace(
        `[GATEWAY] ${cl.bold(conn.id)} disconnected (${cl.yellow(code)})`
      );
      
      Gateway.connections.delete(conn);
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

    Gateway.connections.add(conn);
  }

  /**
   * @param {number} op 
   * @param {(conn: Connection) => Promise<boolean> | boolean} predicate 
   * @param {*} data 
   */
  static async emit(op, predicate, data) {
    for (const conn of this.connections) {
      if (conn.user && await predicate(conn)) {
        conn.send(op, data);
      }
    }
  }
}