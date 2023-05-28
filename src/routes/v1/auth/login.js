import { getRequestIP, uid } from "../../../util/index.js";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import z from "zod";

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

  const user = await prisma.user.findFirst({
    where: { username: data.username },
  });

  if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
    return res.status(401).json({
      code: "INVALID_USERNAME_OR_PASSWORD"
    });
  }

  const userData = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
  };

  const existing = await prisma.session.findFirst({
    where: {
      user_id: user.id,
      ip: getRequestIP(req),
      useragent: req.headers["user-agent"],
      expires: {
        gt: Date.now()
      }
    },
  });

  if (existing) {
    res.json({
      token: existing.token,
      user: userData
    })
  } else {
    const token = randomBytes(32).toString("base64url");

    await prisma.session.create({
      data: {
        token,
        id: uid.getUniqueID(),
        user_id: user.id,
        ip: getRequestIP(req),
        useragent: req.headers["user-agent"],
        expires: Date.now() + (7 * 24 * 3600 * 1000), // 7 days
        strict: data.strict ?? false
      },
    });

    res.json({
      token,
      user: userData
    })
  }
}
