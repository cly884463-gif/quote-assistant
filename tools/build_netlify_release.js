const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release", "quote-assistant-site");

fs.mkdirSync(path.join(releaseDir, "assets"), { recursive: true });

const html = fs
  .readFileSync(path.join(root, "web", "index.html"), "utf8")
  .replace(
    "../assets/interior-bg.jpg",
    `data:image/jpeg;base64,${fs.readFileSync(path.join(root, "assets", "interior-bg.jpg")).toString("base64")}`
  );

fs.writeFileSync(path.join(releaseDir, "index.html"), html, "utf8");
fs.copyFileSync(path.join(root, "web", "styles.css"), path.join(releaseDir, "styles.css"));
fs.copyFileSync(path.join(root, "web", "app.js"), path.join(releaseDir, "app.js"));
fs.copyFileSync(path.join(root, "web", "data.js"), path.join(releaseDir, "data.js"));
fs.copyFileSync(path.join(root, "assets", "interior-bg.jpg"), path.join(releaseDir, "assets", "interior-bg.jpg"));

fs.writeFileSync(path.join(releaseDir, "_redirects"), "/* /index.html 200\n", "utf8");
fs.writeFileSync(
  path.join(releaseDir, "netlify.toml"),
  `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex"
`,
  "utf8"
);

if (!html.includes("装修材料报价助手")) {
  throw new Error("HTML encoding check failed");
}

if (!html.includes("创建经销商批发报价</button>")) {
  throw new Error("HTML tag check failed");
}

if (!html.includes("data:image/jpeg;base64,")) {
  throw new Error("Inline background check failed");
}

console.log("netlify release generated");
