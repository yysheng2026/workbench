# 我的闯关工作台（手账风个人工作台）

一个**单文件、零依赖**的个人生活/装修/投资/学习看板，纯前端 HTML，数据默认存浏览器 `localStorage`，并可开启 **JSONBin.io 云端同步**实现电脑/手机跨设备共享同一份数据。

## 正式部署（Cloudflare Pages，推荐）
GitHub Pages 部署队列偶发拥堵超时，故正式站点走 **Cloudflare Pages**（部署快、稳定）。

1. 打开 https://dash.cloudflare.com → 左侧 **Workers & Pages → Create → Pages → Connect to Git**。
2. 授权连接 GitHub，仓库选 **`yysheng2026/workbench`**。
3. 构建配置：
   - **Framework preset**：`None`
   - **Build command**：留空
   - **Output directory**：`/`（根目录已有 index.html）
4. 点 **Save and Deploy**，获得地址 `https://workbench.<子域>.pages.dev`。
5. 之后每次 `git push`（开 VPN）即自动重新部署，不再走 GitHub Pages 拥堵队列。
6. 可选：Settings → Custom domains 绑定自己的域名。

> 旧地址 `https://yysheng2026.github.io/workbench/` 仍可用（GitHub Pages 恢复后也会更新），但以 Cloudflare Pages 为准。

## 如何更新页面
本仓库的 `index.html` 由本地 `个人工作台.html` 复制而来。修改源文件后，重新复制覆盖本仓库的 `index.html` 再 `git push` 即可（Cloudflare Pages 约 30 秒内生效）。

## 缓存策略（`_headers`）
- `index.html` / `sw.js`：`no-cache`（保证每次拿到最新版与离线脚本）。
- `manifest.webmanifest` 与各图标：缓存 1 天，PWA 图标稳定可缓存。

## 开启跨设备云同步（推荐手机+电脑共用）
1. 打开页面顶栏「☁ 云同步」→ 填 JSONBin.io 的 **API Key** 与 **Bin ID**（Bin ID 留空会自动新建一个）。
2. 电脑与手机**填同一组** Key+Bin，即自动读写同一份数据。
3. 密钥只存各自浏览器的 `localStorage`，**不进网页源码**，公开网址不会泄露。
4. 未联网 / 接口故障时自动退回本机 `localStorage`，不影响使用。

## 技术说明
- 唯一外部依赖：Google Fonts CDN（手写风字体），已用绝对 https 地址，任意静态托管均可。
- 行情/复盘数据以内联 JSON 注入，页面本身不联网取数（除可选的云同步）。
- 冲突策略：`__updatedAt` 时间戳 last-write-wins（个人单用户足够）。
