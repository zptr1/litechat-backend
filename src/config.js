import { readFileSync } from "fs";
import { parse } from "toml";

const data = parse(readFileSync("config.toml", "utf-8"));
const modes = Object.keys(data).filter((x) => x != "default");

if (process.argv.length < 3 || !modes.includes(process.argv[2])) {
  console.error(`Usage: ... <mode: (${modes.join(" | ")})>`);
  process.exit(1);
}

/**
 * @type {{
 *  type: 'prod' | 'dev',
 *  port: number,
 *  version: number,
 *  log_level: keyof typeof import("./util/logger").LOG_COLORS,
 *  log_webhook: string | false
 * }}
 */
export const config = {
  type: process.argv[2],
  ...data["default"], ...data[process.argv[2]]
}