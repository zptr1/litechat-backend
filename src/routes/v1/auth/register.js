import { getRequestIP, uid } from "../../../util/index.js";
import { UsernameTakenError } from "../../../errors.js";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import z from "zod";

// TODO: use cloudflare's captcha
/// This would be a temporary solution
/// since I plan on splitting the API server
/// into multiple smaller services in the future.
/// The client will handle captcha instead,
/// but for now I just want to get this shit working.

const prisma = new PrismaClient();
const body = z.object({
  username: z.string().min(1).max(32)
    .regex(/^[a-z0-9_.-]+$/),
  password: z.string().min(1).max(64),
  strict: z.boolean().optional()
});

/** @type {import("../..").Route} */
export async function post(req, res) {
  const data = body.parse(req.body);

  if (
    await prisma.user.findFirst({
      where: { username: data.username },
    })
  ) {
    throw new UsernameTakenError();
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);
  const sessionToken = randomBytes(32).toString("base64url");
  const id = uid.getUniqueID();

  await prisma.user.create({
    data: {
      id,
      username: data.username,
      password_hash: passwordHash,
      display_name: null,
      sessions: {
        create: {
          id: uid.getUniqueID(),
          token: sessionToken,
          ip: getRequestIP(req),
          useragent: req.headers["user-agent"],
          strict: data.strict ?? false,
          expires: new Date(Date.now() + (7 * 24 * 3600 * 1000))
        }
      }
    },
  });

  res.json({
    token: sessionToken,
    user: {
      id: id.toString(),
      username: data.username,
      display_name: null,
    },
  });
}
