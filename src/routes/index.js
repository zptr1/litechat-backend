import { Log } from "../logger.js";
import cl from "cli-color";

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export function $middleware(req, res, next) {
  Object.defineProperty(req, "ip", {
    value: (
      req.headers["cf-connecting-ip"]   // Cloudflare
      || req.headers["x-real-ip"]       // nginx
      || req.headers["x-forwarded-for"] // nginx as well
      || req.ip
    )
  });
  
  Log.info(`${cl.blackBright(req.ip)} ${cl.green(req.method.toUpperCase())} ${cl.whiteBright.bold(req.path)}`);
  Log.blank(req.headers["user-agent"]);

  next();
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export function get(req, res) {
  res.json({
    latest_version: 1,
    uptime_minutes: Math.round(process.uptime() / 60)
  });
}