import { getReqAuth } from "../../../util/index.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import z from "zod";

const prisma = new PrismaClient();

/** @type {import("../..").Route} */
export async function get(req, res) {
  const { user } = await getReqAuth(req);

  res.json({
    id: user.id.toString(),
    username: user.username,
    display_name: user.display_name,
  });
}

const UPDATE_USER_BODY = z.object({
  username: z.string()
    .min(1).max(32)
    .regex(/^[a-z0-9._-]+$/)
    .optional(),
  display_name: z.string().min(1).max(32).or(z.null()).optional(),
  password: z.object({
    old: z.string().min(1).max(64),
    new: z.string().min(1).max(64),
  }).optional(),
});

/** @type {import("../..").Route} */
export async function post(req, res) {
  const { user } = await getReqAuth(req);
  const data = UPDATE_USER_BODY.parse(req.body);

  if (data.username) {
    if (
      await prisma.user.findFirst({
        where: { username: data.username },
      })
    ) {
      return res.status(409).json({
        code: "USERNAME_TAKEN"
      });
    }

    user.username = data.username;
  }

  if (data.display_name) {
    user.display_name = data.display_name.replace(
      /[\s\x00-\x20\x7f-\xa0\xad\u115f\u1160\u17b4\u17b5\u180b-\u180f\u2000-\u200f\u2028-\u202f\u205f-\u206f\u3000\u3164\ufe00-\ufe0f\ufeff\uffa0\ufff0-\ufff8]+/g, " "
    ).trim() || null;
  } else if (data.display_name == null) {
    user.display_name = null;
  }

  if (data.password) {
    if (!(await bcrypt.compare(data.password.old, user.password_hash))) {
      return res.status(401).json({
        code: "INVALID_PASSWORD",
      });
    }

    user.password_hash = await bcrypt.hash(data.password.new, 10);
  }

  await prisma.user.update({
    data: {
      username: user.username,
      display_name: user.display_name,
      password_hash: user.password_hash,
    },
    where: {
      id: user.id,
    },
  });

  res.json({
    id: user.id.toString(),
    username: user.username,
    display_name: user.display_name,
  });
}
