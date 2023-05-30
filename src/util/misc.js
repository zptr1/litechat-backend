import { Snowflake } from "nodejs-snowflake";
import { config } from "../config.js";

export const uid = new Snowflake({
  custom_epoch: config.snowflake_epoch
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