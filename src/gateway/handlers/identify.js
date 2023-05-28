import { fetchUserByToken } from "../../util/database.js";
import { CloseCode } from "../connection.js";
import { PacketType } from "../packet.js";
import z from "zod";

export const type = PacketType.Identify;
export const data = z.object({
  token: z.string().max(100),
});

/**
 * @param {import("../connection").Connection} conn
 * @param {z.infer<typeof data>} data
 */
export async function handle(conn, data) {
  const auth = await fetchUserByToken(data.token);

  if (!auth) {
    return conn.ws.close(CloseCode.Unauthorized);
  }

  conn.user = auth.user;
  conn.session = auth.session;

  conn.send(PacketType.Identify, {
    user: {
      id: auth.user.id,
      username: auth.user.username,
      display_name: auth.user.display_name,
    },
  });
}
