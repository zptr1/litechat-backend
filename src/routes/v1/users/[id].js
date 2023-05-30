import { checkReqAuth } from "../../../util/index.js";
import { NotFoundError } from "../../../errors.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** @type {import("../..").Route} */
export async function get(req, res, next) {
  if (!req.params.id.match(/^\d{1,18}$/)) {
    return next();
  }

  await checkReqAuth(req);
  const user = await prisma.user.findFirst({
    where: {
      id: BigInt(req.params.id)
    }
  });

  if (!user) {
    throw new NotFoundError();
  }

  res.json({
    id: user.id.toString(),
    username: user.username,
    display_name: user.display_name
  });
}
