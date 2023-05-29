import { fetchUserByToken } from "./database";

export class UnauthorizedError extends Error {}

/**
 * @param {import("express").Request} req
 */
export async function getReqAuth(req) {
  const token = (req.headers["authorization"] || req.query.token).toString();
  if (!token) {
    throw new UnauthorizedError();
  }

  const auth = await fetchUserByToken(token);
  if (!auth) {
    throw new UnauthorizedError();
  }

  return auth;
}

/**
 * @param {import("express").Request} req
 * @returns {string}
 */
export function getRequestIP(req) {
  return (
    req.headers["cf-connecting-ip"] // cloudflare
    || req.headers["x-real-ip"] // nginx
    || req.headers["x-forwarded-for"] // also nginx
    || req.ip // no proxy?
  );
}
