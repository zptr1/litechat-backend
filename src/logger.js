import { config } from "./config.js";
import cl from "cli-color";

export const LOG_LEVEL = [
  "debug",
  "trace",
  "info",
  "warn",
  "error",
  "fatal"
];

export const LOG_COLORS = {
  debug: cl.bgBlackBright,
  trace: cl.black.bgWhite,
  info: cl.white.bgCyanBright,
  warn: cl.black.bgYellowBright,
  error: cl.black.bgRedBright,
  fatal: cl.whiteBright.bgRed
}

export class Log {
  static logLevel = LOG_LEVEL.indexOf(config.log_level);

  /** @private */
  static _log(level, data) {
    if (LOG_LEVEL.indexOf(level) >= this.logLevel) {
      console.log(
        LOG_COLORS[level](
          " " + level.toUpperCase().padEnd(6, " ")
        ), cl.blackBright("•"), ...data
      );
    }
  }

  static blank(...data) {
    console.log(" ".repeat(7), cl.blackBright("\\") + "\x1b[30m", ...data, "\x1b[0m");
  }

  static fatal(...data) {
    this._log("fatal", data);
    process.exit(1);
  }

  static error(...data) {
    this._log("error", data);
  }

  static warn(...data) {
    this._log("warn", data);
  }
  
  static info(...data) {
    this._log("info", data);
  }

  static trace(...data) {
    this._log("trace", data);
  }

  static debug(...data) {
    this._log("debug", data);
  }
}
