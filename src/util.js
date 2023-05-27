import { Snowflake } from "nodejs-snowflake";

export const uid = new Snowflake({
  custom_epoch: 1672531200000 // first second of 2023
});

export function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

export function isObject(o) {
  return (
    typeof o == "object"
    && typeof o != "undefined"
    && !Array.isArray(o)
    && o != null
  );
}

/** @param {import("express").Request} req */
export function getRequestIP(req) {
  return (
    req.headers["cf-connecting-ip"]   // cloudflare
    || req.headers["x-real-ip"]       // nginx
    || req.headers["x-forwarded-for"] // also nginx
    || req.ip                         // no proxy?
  );
}

/**
 * @template {string} T
 * @param {T[]} list 
 * @returns {{[K in T]: number}}
 */
export function Enum(list) {
  const o = {};
  for (let i = 0; i < list.length; i++) {
    o[list[i]] = i;
    o[i] = list[i];
  }
  return o;
}