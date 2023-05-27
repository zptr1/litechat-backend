import { CloseCode } from "../connection.js";
import { PacketType } from "../packet.js";
import { Gateway } from "../index.js";

export const type = PacketType.Heartbeat;

/**
 * @param {import("../connection").Connection} conn
 */
export async function handle(conn) {
  conn.lastHeartbeatAt = Date.now();
  conn.send(PacketType.Heartbeat, {});
}

setInterval(() => {
  Gateway.connections.forEach((conn) => {
    if (conn.lastHeartbeatAt + 30000 < Date.now()) {
      conn.ws.close(CloseCode.TimedOut);
    }
  });
}, 15000);
