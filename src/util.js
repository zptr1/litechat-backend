/** @param {import("express").Request} req */
export function getRequestIP(req) {
  return (
    req.headers["cf-connecting-ip"]   // cloudflare
    || req.headers["x-real-ip"]       // nginx
    || req.headers["x-forwarded-for"] // also nginx
    || req.ip                         // no proxy?
  );
}