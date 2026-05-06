import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { createApp, startServer } from "../server.js";

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://${address.address}:${address.port}`);
    });
  });
}

test("serves the existing exam prep assets over HTTP", async (t) => {
  const server = createServer(createApp());
  const baseUrl = await listen(server);
  t.after(() => server.close());

  const indexResponse = await fetch(`${baseUrl}/`);
  assert.equal(indexResponse.status, 200);
  assert.match(await indexResponse.text(), /CDMP Prep Hub/);

  const appResponse = await fetch(`${baseUrl}/app.js`);
  assert.equal(appResponse.status, 200);
  assert.match(await appResponse.text(), /questionBank/);
});

test("reports server startup errors instead of logging success", () => {
  const startupError = new Error("bind failed");
  const messages = [];
  const logger = {
    error(message) {
      messages.push(message);
    },
    log() {}
  };
  const app = {
    listen(_port, _host, onListen) {
      onListen(startupError);
      return { close() {} };
    }
  };
  const previousExitCode = process.exitCode;

  process.exitCode = undefined;

  try {
    startServer({ app, port: 3000, host: "127.0.0.1", logger });

    assert.equal(process.exitCode, 1);
    assert.match(messages[0], /Unable to start CDMP Prep Hub/);
    assert.match(messages[0], /bind failed/);
  } finally {
    process.exitCode = previousExitCode;
  }
});
