# Netlify + GitHub 固定链接自动更新

## 目标

把本项目绑定到 GitHub 仓库，再让 Netlify 绑定这个仓库。以后只要代码推送到 GitHub，Netlify 会自动重新部署，原来的网页链接保持不变。

## Netlify 构建配置

项目根目录已经提供 `netlify.toml`：

```toml
[build]
  command = "node tools/build_netlify_release.js"
  publish = "release/quote-assistant-site"
```

Netlify 每次部署时会自动生成发布目录，不需要手动上传 zip。

## 推荐流程

1. 在 GitHub 创建一个私有仓库，例如：`quote-assistant`。
2. 把本地项目推送到这个仓库。
3. 打开 Netlify 后台，选择 `Add new site` -> `Import an existing project`。
4. 选择 GitHub，授权后选中这个仓库。
5. 构建配置保持：
   - Build command: `node tools/build_netlify_release.js`
   - Publish directory: `release/quote-assistant-site`
6. 部署完成后，把生成的 Netlify 链接发给同事。

## 后续更新

以后每次改完代码，只需要：

```bat
git add .
git commit -m "update quote assistant"
git push github master
```

Netlify 会自动更新同一个链接。
