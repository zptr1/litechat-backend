import { config } from "./config.js";
import cl from "cli-color";

export const LOG_LEVEL = ["debug", "trace", "info", "warn", "error", "fatal"];

export const LOG_COLORS = {
  debug: cl.bgBlackBright,
  trace: cl.black.bgWhite,
  info: cl.white.bgCyanBright,
  warn: cl.black.bgYellowBright,
  error: cl.black.bgRedBright,
  fatal: cl.whiteBright.bgRed,
};

function log(level, data) {
  if (LOG_LEVEL.indexOf(level) < Log.logLevel) return;

  console.log(
    LOG_COLORS[level](" " + level.toUpperCase().padEnd(6, " ")),
    cl.blackBright("•"),
    ...data
  );

  if (config.log_webhook) {
    sendWebhookChunked(
      `**\` ${level.toUpperCase().padEnd(6, " ")}\`** • ${data}`
    );
  }
}

let sendWebhookChunk = "";
let sendWebhookTimer = null;

function _sendWebhookChunk() {
  fetch(config.log_webhook, {
    method: "POST",
    body: JSON.stringify({
      content: sendWebhookChunk.trim().replace(/\x1b\[\d+(;\d+)*m/g, ""),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  sendWebhookChunk = "";
}

function sendWebhookChunked(message) {
  clearTimeout(sendWebhookTimer);

  if ((sendWebhookChunk + message).length >= 2000) {
    _sendWebhookChunk();
  }

  sendWebhookChunk += `\n${message}`;
  sendWebhookTimer = setTimeout(() => _sendWebhookChunk(), 1000);
}

export class Log {
  static logLevel = LOG_LEVEL.indexOf(config.log_level);

  static multiline(lines) {
    for (const line of lines) {
      console.log(" ".repeat(7), cl.blackBright(`| ${line}`));
    }

    if (config.log_webhook) {
      sendWebhookChunked(`\`\`\`\n${lines.join("\n")}\n\`\`\``);
    }
  }

  static fatal(...data) {
    log("fatal", data);
    process.exit(1);
  }

  static error(...data) {
    log("error", data);
  }

  static warn(...data) {
    log("warn", data);
  }

  static info(...data) {
    log("info", data);
  }

  static trace(...data) {
    log("trace", data);
  }

  static debug(...data) {
    log("debug", data);
  }
}
