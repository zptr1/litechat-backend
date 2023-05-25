import { readFileSync } from "fs";
import { parse } from "toml";

const data = parse(readFileSync("config.toml", "utf-8"));

if (process.argv.length < 3 || !(process.argv[2] in data)) {
  console.error(`Usage: ... <mode: (${Object.keys(data).join(" | ")})>`);
  process.exit(1);
}

/**
 * @type {{
 *  type: 'prod' | 'dev',
 *  port: number,
 *  log_level: keyof typeof import("./logger").LOG_COLORS
 * }}
 */
export const config = {
  type: process.argv[2],
  ...data[process.argv[2]]
}