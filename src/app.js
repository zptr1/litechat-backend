import wittyComments from "../data/witty-comments.json" assert { type: "json" };
import { Log, getRequestIP, UnauthorizedError } from "./util/index.js";
import { PacketHandler } from "./gateway/packet.js";
import { Gateway } from "./gateway/index.js";
import { config } from "./config.js";
import bodyParser from "body-parser";
import expressWs from "express-ws";
import { ZodError } from "zod";
import express from "express";
import { glob } from "glob";
import cl from "cli-color";
import util from "util";

import "express-async-errors";


const AVAILABLE_METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
];

export class App {
  constructor() {
    this.app = express();
    this.wss = expressWs(this.app);
    this.gateway = new Gateway(this);
  }

  async loadRoutes() {
    Log.trace(`Loading routes...`);

    const files = (await glob("src/routes/**/*.js")).filter((x) =>
      x.endsWith(".js")
    );

    let routeCount = 0;
    let middlewareCount = 0;

    for (const file of files) {
      const mod = await import(`../${file}`);
      const route = file
        .split(/[\/\\]/).slice(2).join("/")
        .replace(/\[(.+?)\]/g, ":$1")
        .replace(/(index)?\.js$/, "")
        .replace(/^\/?/, "/");

      for (const method in mod) {
        if (method == "middleware") {
          this.app.use(route, mod[method]);
          middlewareCount++;
        } else if (method == "$middleware") {
          this.app.use(mod[method]);
          middlewareCount++;
        } else if (AVAILABLE_METHODS.includes(method)) {
          this.app[method](route, mod[method]);
          Log.debug(
            `Loaded route ${cl.green(
              method.toUpperCase()
            )} ${cl.whiteBright.bold(route)}`
          );
          routeCount++;
        } else {
          Log.error(`Invalid method ${cl.red(method)} in ${cl.red(file)}`);
        }
      }
    }

    Log.info(
      `Loaded ${cl.cyanBright(routeCount)} routes and ${cl.cyanBright(
        middlewareCount
      )} middlewares from ${cl.cyanBright(files.length)} files`
    );
  }

  async start() {
    this.app.use(bodyParser.json({ strict: true }));
    this.app.use((req, res, next) => {
      Log.debug(`[REST] ${cl.blackBright(getRequestIP(req))} ${cl.green(req.method.toUpperCase())} ${req.path}`);
      next();
    });
    
    await this.loadRoutes();
    await PacketHandler.loadHandlers();

    this.app.use((err, req, res, next) => {
      if (err instanceof ZodError) {
        res.status(400).json({
          code: "INVALID_REQUEST",
          errors: err.format()
        });
      } else if (err instanceof UnauthorizedError) {
        res.status(401).json({
          code: "UNAUTHORIZED"
        });
      } else {
        Log.error(`[REST] Route ${cl.red(req.method.toUpperCase())} ${cl.redBright.bold(req.path)} failed`);
        Log.multiline((err.stack || err.trace || err).toString().split("\n"));
        
        Log.debug("Request Body:");
        Log.multiline(
          util.inspect(req.body, {
            compact: true,
            colors: true
          }).split("\n").slice(0, 1000)
        );

        Log.debug("Request Headers:");
        Log.multiline([
          ...Object.entries(
            req.headers
          ).map(
            ([key, value]) => `${key}: ${value}`
          )
        ]);
  
        res.status(500).json({
          code: "INTERNAL_SERVER_ERROR",
          comment: wittyComments[Math.floor(Math.random() * wittyComments.length)]
        });
      }
    });

    this.app.use((req, res, next) => {
      res.status(404).json({
        code: "ROUTE_NOT_FOUND",
        comment: wittyComments[Math.floor(Math.random() * wittyComments.length)]
      });
    });

    this.app.listen(config.port, () => {
      Log.info(`Listening on port ${cl.cyan(config.port)}`);
    });

    this.wss.getWss().on("listening", () => {
      Log.info(`WSS ready`);
    });
  }
}
