import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readPort(value) {
  const port = Number.parseInt(value || "3000", 10);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}

export function createApp({ staticDir = __dirname } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(express.static(staticDir, { extensions: ["html"] }));

  app.use((req, res, next) => {
    if (req.method !== "GET" || !req.accepts("html")) {
      next();
      return;
    }

    res.sendFile(path.join(staticDir, "index.html"));
  });

  return app;
}

export function startServer({
  app = createApp(),
  port = readPort(process.env.PORT),
  host = process.env.HOST || "127.0.0.1",
  logger = console
} = {}) {
  return app.listen(port, host, (error) => {
    if (error) {
      logger.error(`Unable to start CDMP Prep Hub: ${error.message}`);
      process.exitCode = 1;
      return;
    }

    logger.log(`CDMP Prep Hub listening at http://${host}:${port}`);
  });
}

const entryPoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === entryPoint) {
  startServer();
}
