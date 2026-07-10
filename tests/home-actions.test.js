const assert = require("assert");
const fs = require("fs");

const wxml = fs.readFileSync("pages/home/index.wxml", "utf8");
const js = fs.readFileSync("pages/home/index.js", "utf8");

assert.ok(wxml.includes("创建经销商批发报价"));
assert.ok(wxml.includes("创建渠道合作报价"));
assert.ok(wxml.includes("bindtap=\"createDealerQuote\""));
assert.ok(wxml.includes("bindtap=\"createChannelQuote\""));
assert.ok(wxml.includes("wx:for=\"{{product.specRows}}\""));
assert.ok(wxml.includes("wx:for=\"{{row.cells}}\""));
assert.ok(wxml.includes("经销商"));
assert.ok(wxml.includes("渠道"));
assert.ok(js.includes("this.createQuote(\"dealer\")"));
assert.ok(js.includes("this.createQuote(\"channel\")"));
assert.ok(js.includes("type=${type}"));

console.log("home quote actions ok");
