import { fetchSessionByToken, fetchUserByToken } from "./database.js";
import { UnauthorizedError } from "../errors.js";

export async function getReqAuth(req) {
  const token = req.headers["authorization"] || req.query.token;

  if (!token) {
    throw new UnauthorizedError();
  }

  const auth = await fetchUserByToken(token.toString());
  if (!auth) {
    throw new UnauthorizedError();
  }

  return auth;
}

export async function checkReqAuth(req) {
  const token = req.headers["authorization"] || req.query.token;

  if (!token) {
    throw new UnauthorizedError();
  }
  
  const session = await fetchSessionByToken(token.toString());
  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

/**
 * @param {import("express").Request} req
 * @returns {string}
 */
export function getRequestIP(req) {
  return (
    req.headers["cf-connecting-ip"]   // cloudflare
    || req.headers["x-real-ip"]       // nginx
    || req.headers["x-forwarded-for"] // also nginx
    || req.ip                         // no proxy?
  );
}
