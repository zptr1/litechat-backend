import wittyComments from "../data/witty-comments.json" assert { type: "json" };
import { config } from "./config.js";
import bodyParser from "body-parser";
import expressWs from "express-ws";
import { Log } from "./logger.js";
import express from "express";
import { glob } from "glob";
import cl from "cli-color";
import util from "util";

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
        .split(/[\/\\]/)
        .slice(2)
        .join("/")
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
    await this.loadRoutes();

    this.app.use((err, req, res, next) => {
      const error = (err.stack || err.trace || err).toString();

      Log.error(`Route ${cl.red(req.method.toUpperCase())} ${cl.redBright.bold(req.path)} failed`);
      Log.multiline(error.split("\n"));
      Log.debug("Request Body:");
      Log.multiline(
        util.inspect(
          req.body, {
            compact: true,
            colors: true
          }
        ).split("\n").slice(0, 1000)
      )
      Log.debug("Request Headers:");
      Log.multiline([
        ...Object.entries(
          req.headers
        ).map(([key, value]) => `${key}: ${value}`)
      ]);

      res.status(500).json({
        error: true,
        message: `Something went wrong`,
        comment: wittyComments[Math.floor(Math.random() * wittyComments.length)]
      })
    });

    this.app.use((req, res, next) => {
      res.status(404).json({
        error: true,
        message: `Route not found`,
        comment: wittyComments[Math.floor(Math.random() * wittyComments.length)]
      });
    });

    this.app.listen(config.port, () => {
      Log.info(`Listening on port ${cl.cyan(config.port)}`);
    });
  }
}
