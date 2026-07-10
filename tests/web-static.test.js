const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "web", "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "web", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "web", "styles.css"), "utf8");
const bat = fs.readFileSync(path.join(root, "web", "start-web.bat"), "utf8");
const data = fs.readFileSync(path.join(root, "web", "data.js"), "utf8");

assert.ok(html.includes("data-start-quote=\"dealer\""));
assert.ok(html.includes("data-start-quote=\"channel\""));
assert.ok(html.includes("id=\"exportImageBtn\""));
assert.ok(html.includes("../assets/interior-bg.jpg"));
assert.ok(html.includes("./data.js"));
assert.ok(html.includes("./app.js"));

assert.ok(js.includes("createCjsLoader"));
assert.ok(js.includes("utils/catalogs.js"));
assert.ok(js.includes("window.__QUOTE_CATALOGS__"));
assert.ok(js.includes("canvas.toDataURL(\"image/png\")"));
assert.ok(js.includes("`${item.id}|${item.spec || item.selectedSpec || \"\"}`"));
assert.ok(js.includes("渠道合作单价"));

assert.ok(data.includes("window.__QUOTE_CATALOGS__"));
assert.ok(data.includes("\"dealer\""));
assert.ok(data.includes("\"channel\""));
assert.ok(data.includes("\"specOptions\""));

assert.ok(css.includes(".quote-card.is-added"));
assert.ok(css.includes(".spec-select"));
assert.ok(css.includes(".quote-controls"));
assert.ok(css.includes("grid-template-columns: 1fr"));
assert.ok(css.includes("grid-template-columns: 42px minmax(56px, 1fr) 42px"));
assert.ok(css.includes(".sheet-top"));
assert.ok(css.includes("@media (max-width: 720px)"));

assert.ok(bat.includes("start \"\" \"%~dp0index.html\""));
assert.ok(!bat.includes("http.server"));

console.log("web static app ok");
