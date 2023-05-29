import { Log, Enum } from "../util/index.js";
import { CloseCode } from "./connection.js";
import { readdir } from "fs/promises";
import cl from "cli-color";

export const PacketType = Enum([
  "Identify",
  "Heartbeat"
]);

/**
 * @typedef {{
 *  type: number,
 *  data: import("zod").ZodObject,
 *  handle: (conn: import("./connection").Connection, data) => Promise<any>
 * }} Handler
 */

export class PacketHandler {
  /** @type {Map<keyof typeof PacketType, Handler>} */
  static handlers = new Map();

  static async loadHandlers() {
    Log.trace("Loading handlers...");

    const handlers = await readdir("src/gateway/handlers");
    for (const file of handlers) {
      if (!file.endsWith(".js")) continue;

      const handler = await import(`./handlers/${file}`);
      this.handlers.set(PacketType[handler.type], handler);

      Log.debug(
        `Loaded handler for packet ${cl.green(PacketType[handler.type])}`
      );
    }

    Log.info(`Loaded ${cl.cyanBright(handlers.length)} handlers`);
  }

  /**
   * @param {import("./connection").Connection} conn
   * @param {*} data
   */
  static async handle(conn, { op, data }) {
    const handler = this.handlers.get(PacketType[op]);
    if (!handler) {
      return conn.ws.close(CloseCode.InvalidOpcode);
    }

    if (op > 1 && !conn.user) {
      return conn.ws.close(CloseCode.Unauthorized);
    }

    if (handler.data) {
      const parse = await handler.data.safeParseAsync(data);
      if (!parse.success) {
        return conn.ws.close(CloseCode.BadPacket);
      }
    }

    Log.debug(
      `[GATEWAY] ${cl.bold(conn.id)} sent packet ${cl.green(
        PacketType[op]
      )}`
    );

    await handler.handle(conn, data);
  }
}
