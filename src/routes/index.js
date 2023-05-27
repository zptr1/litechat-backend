import { config } from "../config.js";
import { execSync } from "child_process"

const LATEST_COMMIT = execSync('git log --format="%h" -n 1')
  .toString().trim();

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export function get(req, res) {
  res.json({
    version: `v${config.version}-${LATEST_COMMIT}`,
    uptime_minutes: Math.round(process.uptime() / 60)
  });
}