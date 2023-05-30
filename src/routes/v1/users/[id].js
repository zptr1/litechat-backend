import { PrismaClient } from "@prisma/client";
import { checkReqAuth } from "../../../util/index.js";

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
    return res.status(404).json({
      code: "NOT_FOUND"
    });
  }

  res.json({
    id: user.id.toString(),
    username: user.username,
    display_name: user.display_name
  });
}
