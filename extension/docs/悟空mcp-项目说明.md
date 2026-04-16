# 悟空 mcp — 项目说明与使用指南

本文档说明 **悟空 mcp** 扩展的实现思路、与云端卡密服务的关系，以及**运营方**与**最终用户**的使用方式。

---

## 一、项目是什么

**悟空 mcp** 是一个 **Cursor / VS Code 扩展**（包名 `wukong-mcp`），在侧栏提供：

- 多路 **MCP 会话**（对应 `my-mcp-1` … `my-mcp-N`），与工作区 `mcp.json` 联动；
- **工作区配置**：把当前侧栏会话列表写入 `mcp.json`；
- **发消息、附件、备忘**等与 Cursor 对话协同的能力（具体以扩展界面为准）；
- **授权**：云端卡密核销、可选本地 WKM1 卡密、30 分钟试用。

云端 **发卡 / 核销 API** 与静态页在独立目录 **`wukong-card-api`**（Node + Express + MySQL），与扩展可分开展示、分开部署。

---

## 二、架构概览

```
┌─────────────────────────────────────────────────────────────┐
│  Cursor / VS Code                                            │
│  ┌──────────────────┐      postMessage      ┌────────────┐ │
│  │ 侧栏 Webview UI   │ ◄──────────────────► │ extension  │ │
│  │ (getHtml 内联)    │                       │ .ts 宿主   │ │
│  └──────────────────┘                       └─────┬──────┘ │
│                                                     │        │
│                     globalState（授权、备忘等）      │        │
│                                                     │        │
│                     HTTPS/HTTP                     ▼        │
└─────────────────────────────────────────────────────┼────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│  wukong-card-api（自建服务器，例：http://5245.fun）            │
│  POST /api/redeem  ·  POST /admin/generate  ·  static 页面   │
│                      MySQL：wukong_license.card_keys          │
└─────────────────────────────────────────────────────────────┘

工作区 mcp.json：由扩展写入 my-mcp-N 条目 → Cursor 启动对应 MCP 子进程（实现见各工作区配置）。
```

---

## 三、扩展侧实现要点

| 模块 | 路径 | 作用 |
|------|------|------|
| 激活入口 | `src/extension.ts` | 注册 Webview、处理消息、配置工作区、与 `license` 交互 |
| 授权逻辑 | `src/license.ts` | 试用、`tryActivateLicenseAsync`（云端）、`tryActivateLicense`（WKM1）、到期清理 |
| 本地 WK M1 生成页 | `tools/license-generator.html` | 浏览器打开（双击），用与 `wukong.licenseSecret` 一致的密钥生成 `WKM1.` 卡密 |
| 构建产物 | `dist/*.js` | `npm run compile`（tsc）输出，运行时使用 |

**云端激活流程（默认）**

1. 用户输入 **非 `WKM1.` 开头**的卡密（如 `XXXX-XXXX-XXXX-XXXX`）。
2. 宿主读取配置 **`wukong.redeemApiBaseUrl`**（默认可设为 `http://你的域名:3000`），请求 **`POST /api/redeem`**，body：`{ code, user }`，`user` 一般为 `vscode.env.machineId`（截断 128）。
3. 响应 **`{ ok: true, licenseExpiresAt? }`**：若有 `licenseExpiresAt` 则本地记**限时**授权，否则记**永久**（仍以扩展内逻辑为准）。
4. **`wukong.cloudLicenseOnly` 为 true** 时，拒绝 **WKM1.** 本地卡密；**默认 false**，云端卡密与 **WKM1** 可同时使用。

**设置项（`package.json` contributes.configuration）**

- `wukong.redeemApiBaseUrl`：核销 API 根地址，无尾斜杠。
- `wukong.redeemTimeoutMs`：请求超时毫秒数。
- `wukong.cloudLicenseOnly`：为 true 时仅云端卡密；默认 false，支持本地 WKM1。
- `wukong.licenseSecret` / `wukong.adminPassword`：本地 WKM1 与管理员命令相关（按需）。

---

## 四、云端服务 `wukong-card-api` 要点

| 接口 | 说明 |
|------|------|
| `POST /admin/generate` | Header：`Authorization: Bearer <ADMIN_TOKEN>`；body：`count`，可选 `daysValid`（须在此天数内核销）、`licenseDaysAfterRedeem`（激活后有效天数，写入列 `license_valid_days`） |
| `POST /api/redeem` | body：`code`，可选 `user`；成功返回 `ok`，若有 `license_valid_days` 则带 `licenseExpiresAt` |
| `GET /health` | 健康检查 |
| 静态页 | `public/generate.html` 发卡页、`public/redeem.html` 核销页（插件用户优先在侧栏激活，勿重复在网页核销同一张卡） |

**数据库**：库 `wukong_license`，表 `card_keys`；若使用「激活后有效天数」，需执行迁移增加列 **`license_valid_days`**（见 `wukong-card-api/migrations/`）。

**环境变量（`.env`）**：`MYSQL_*`、`SERVER_SECRET`、`ADMIN_TOKEN`、`PORT` 等。

---

## 五、使用方法

### 5.1 最终用户（装扩展的人）

1. 从 **市场**或 **.vsix** 安装 **悟空 mcp**。
2. 打开侧栏 **悟空 mcp**，可 **试用 30 分钟** 或输入 **卡密激活**（云端格式由你的发卡系统生成）。
3. 选择工作区路径，按需 **添加会话**，点击 **开始配置** 写入 `mcp.json`。
4. 在对应 **Cursor 对话**里使用与通道一致的 MCP（例如让助手调用 **my-mcp-1** 的 `check_messages`），按各工作区规则使用。

### 5.2 运营 / 发卡方

1. 部署 **`wukong-card-api`**（Node、MySQL、防火墙与安全组放行业务端口）。
2. 配置 **`.env`**，执行 **`npm install`**，用 **pm2** 等常驻进程。
3. 使用 **`/admin/generate`**（curl、Postman 或 `generate.html`）批量发卡；妥善保管 **`ADMIN_TOKEN`**。
4. 将 **`wukong.redeemApiBaseUrl`** 告知用户或在文档中写死默认服务地址（用户可在设置里修改）。

### 5.3 开发者改扩展

```bash
cd my-ui-ext
npm install
npm run compile
# 调试：在 VS Code/Cursor 中 F5 启动 Extension Development Host
# 打包：npx @vscode/vsce package --no-dependencies
# 发布：npx @vscode/vsce publish（需 PAT）
```

---

## 六、版本与分发

- **版本号**：`package.json` 的 `version`；与市场 / VSIX 一致。
- **市场类型**：选择 **Visual Studio Code** 扩展；**不要**与 **Azure DevOps 扩展**上传通道混用。
- **更新已有扩展**：在发布者后台对 **已有扩展**使用「更新/上传新版本」，或 **`vsce publish`**；勿用 **New extension** 重复登记同名 `name`。

---

## 七、相关路径速查

| 内容 | 路径 |
|------|------|
| 扩展源码 | `my-ui-ext/src/extension.ts`、`my-ui-ext/src/license.ts` |
| 云端 API | `wukong-card-api/server.js` |
| 静态页 | `wukong-card-api/public/` |
| DB 迁移示例 | `wukong-card-api/migrations/` |

---

*文档随仓库迭代，若与代码不一致，以源码为准。*
