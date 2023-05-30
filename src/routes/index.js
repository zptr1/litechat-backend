import { execSync } from "child_process";
import { config } from "../config.js";
import express from "express";

const LATEST_COMMIT = execSync('git log --format="%h" -n 1')
  .toString().trim();

/**
 * @typedef {(req: express.Request, res: express.Response, next?: express.NextFunction) => Promise<any> | any} Route
 */

/** @type {Route} */
export function get(req, res) {
  res.json({
    version: `v${config.version}-${LATEST_COMMIT}`,
    uptime_minutes: Math.round(process.uptime() / 60)
  });
}