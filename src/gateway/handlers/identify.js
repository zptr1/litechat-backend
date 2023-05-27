import { PacketType } from "../packet.js";
import z from "zod";

export const type = PacketType.Identify;
export const data = z.object({
  username: z.string()
    .min(2).max(32).regex(/^[a-z_.-]+$/),
  password: z.string().min(1).max(64)
});

/**
 * @param {import("../connection").Connection} conn
 * @param {z.infer<typeof data>} data
 */
export async function handle(conn, data) {
  
}