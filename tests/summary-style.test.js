const assert = require("assert");
const fs = require("fs");

const css = fs.readFileSync("pages/summary/index.wxss", "utf8");

assert.match(css, /\.top-row text\s*\{[^}]*background:\s*#fff200;/);
assert.match(css, /\.top-row text\s*\{[^}]*border-top:\s*1rpx solid #1f2933;/);
assert.doesNotMatch(css, /\.sheet\s*\{[^}]*border-top:\s*1rpx solid #1f2933;/);

console.log("summary style ok");
