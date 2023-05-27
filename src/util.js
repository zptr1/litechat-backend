import { Snowflake } from "nodejs-snowflake";

export const uid = new Snowflake({
  custom_epoch: 1672531200000 // first second of 2023
})

/** @param {import("express").Request} req */
export function getRequestIP(req) {
  return (
    req.headers["cf-connecting-ip"]   // cloudflare
    || req.headers["x-real-ip"]       // nginx
    || req.headers["x-forwarded-for"] // also nginx
    || req.ip                         // no proxy?
  );
}