import { Connection } from "./connection.js";
import { Log } from "./logger.js";
import expressWs from "express-ws";
import express from "express";
import cl from "cli-color";

export class Gateway {
  /** @type {Set<Connection>} */
  connections = new Set();

  /** @param {import("./app").App} app */
  constructor(app) {
    this.router = express.Router();
    this.app = app;

    expressWs(this.router);
    
    this.router.ws("/", (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.app.app.use("/gateway", this.router);
  }

  /**
   * @param {import("ws").WebSocket} ws 
   * @param {import("express").Request} req 
   */
  async handleConnection(ws, req) {
    const conn = new Connection(ws, req);
    await conn.initialize();

    Log.trace(`${cl.blackBright(conn.ip)} connected to gateway (${conn.id})`);
    
    ws.on("close", (code, reason) => {
      Log.trace(`${cl.blackBright(conn.ip)} disconnected (${conn.id})`);
      this.connections.delete(conn);
    });

    this.connections.add(conn);
  }
}