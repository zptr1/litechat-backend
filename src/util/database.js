import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchSessionByToken(token) {
  return await prisma.session.findFirst({
    where: {
      token,
      expires: { gt: new Date() },
    },
  });
}

/**
 *
 * @param {string} token
 * @returns {Promise<null | {
 *   user: import("@prisma/client").User,
 *   session: import("@prisma/client").Session
 * }>}
 */
export async function fetchUserByToken(token) {
  const session = await fetchSessionByToken(token);

  if (session) {
    const user = await prisma.user.findFirst({
      where: { id: session.user_id },
    });

    return { session, user };
  } else {
    return null;
  }
}
