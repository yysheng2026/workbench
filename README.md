# 我的闯关工作台（手账风个人工作台）

一个**单文件、零依赖**的个人生活/装修/投资/学习看板，纯前端 HTML，数据默认存浏览器 `localStorage`，并可开启 **JSONBin.io 云端同步**实现电脑/手机跨设备共享同一份数据。

## 部署（GitHub Pages）
1. 本仓库即静态站点，`index.html` 为入口。
2. 在 GitHub 仓库 **Settings → Pages → Build and deployment → Source: Deploy from a branch → 选 `main` / 根目录 `/`**。
3. 约 1 分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`，电脑关机后手机也能打开。
4. 如需自定义域名，在 Pages 设置里填，并加 CNAME 记录。

## 如何更新页面
本仓库的 `index.html` 由本地 `个人工作台.html` 复制而来。修改源文件后，重新复制覆盖本仓库的 `index.html` 再 `git push` 即可（GitHub Pages 约 1 分钟生效）。

## 开启跨设备云同步（推荐手机+电脑共用）
1. 打开页面顶栏「☁ 云同步」→ 填 JSONBin.io 的 **API Key** 与 **Bin ID**（Bin ID 留空会自动新建一个）。
2. 电脑与手机**填同一组** Key+Bin，即自动读写同一份数据。
3. 密钥只存各自浏览器的 `localStorage`，**不进网页源码**，公开网址不会泄露。
4. 未联网 / 接口故障时自动退回本机 `localStorage`，不影响使用。

## 技术说明
- 唯一外部依赖：Google Fonts CDN（手写风字体），已用绝对 https 地址，任意静态托管均可。
- 行情/复盘数据以内联 JSON 注入，页面本身不联网取数（除可选的云同步）。
- 冲突策略：`__updatedAt` 时间戳 last-write-wins（个人单用户足够）。
