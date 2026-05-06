import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("package scripts run the app with Next.js", async () => {
  const packageJson = await readJson("package.json");

  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.equal(packageJson.scripts.test, "node --test");
  assert.ok(packageJson.dependencies.next);
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies["react-dom"]);
  assert.equal(packageJson.dependencies.express, undefined);
  assert.equal(packageJson.dependencies.dotenv, undefined);
});

test("App Router files contain the CDMP prep experience", async () => {
  const layout = await readFile("app/layout.jsx", "utf8");
  const page = await readFile("app/page.jsx", "utf8");
  const styles = await readFile("app/globals.css", "utf8");

  assert.match(layout, /CDMP Prep Hub/);
  assert.match(page, /"use client"/);
  assert.match(page, /questionBank/);
  assert.match(page, /Practice Weak Area/);
  assert.match(page, /localStorage/);
  assert.match(styles, /\.question-card/);
});
