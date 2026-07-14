const assert = require("assert");
const fs = require("fs");

const projectConfig = JSON.parse(fs.readFileSync("project.config.json", "utf8"));
const appConfig = JSON.parse(fs.readFileSync("app.json", "utf8"));
const sitemap = JSON.parse(fs.readFileSync("sitemap.json", "utf8"));
const homeWxml = fs.readFileSync("pages/home/index.wxml", "utf8");
const netlifyConfig = fs.readFileSync("netlify.toml", "utf8");

assert.strictEqual(projectConfig.compileType, "miniprogram");
assert.ok(projectConfig.appid && projectConfig.appid.startsWith("wx"));
assert.deepStrictEqual(appConfig.pages, [
  "pages/home/index",
  "pages/quote/index",
  "pages/summary/index"
]);
assert.strictEqual(appConfig.window.navigationBarTitleText, "日常报价");
assert.strictEqual(sitemap.rules[0].action, "disallow");
assert.strictEqual(sitemap.rules[0].page, "*");
assert.ok(homeWxml.includes("/assets/interior-bg.jpg"));
assert.ok(projectConfig.packOptions.ignore.some((item) => item.value === "tests"));
assert.ok(projectConfig.packOptions.ignore.some((item) => item.value === "tools"));
assert.ok(projectConfig.packOptions.ignore.some((item) => item.value === "docs"));
assert.ok(projectConfig.packOptions.ignore.some((item) => item.value === "assets/interior-bg.png"));
assert.ok(netlifyConfig.includes("command = \"node tools/build_netlify_release.js\""));
assert.ok(netlifyConfig.includes("publish = \"release/quote-assistant-site\""));

console.log("deploy config ok");
