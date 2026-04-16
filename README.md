# Cursor MCP Bridge

A **Cursor / VS Code** extension (package id **`cursor-mcp-bridge`**) that manages multiple **Model Context Protocol (MCP)** sessions from the sidebar. It exchanges messages with Cursor chats via tools such as `check_messages` (text, screenshots, attachments).

## Features

- **Multi-session** (up to 32 channels by default), mapped to `my-mcp-1` … `my-mcp-N` in Cursor config
- **One-click workspace setup** writes `.cursor/mcp.json` and rule files
- Optional memos per channel; rich messages (images and files)

More detail: [`extension/readme.md`](extension/readme.md) (includes step-by-step **user guide**). Architecture and paths: [`extension/docs/project-overview.md`](extension/docs/project-overview.md).

## Development & packaging

```bash
cd extension
npm install
npm run compile   # if TypeScript sources are present
npm run package   # builds .vsix (requires vsce)
```

Main entry: `extension/dist/extension.js`. MCP server logic: `extension/mcp-server/index.mjs`.

## Environment variables (MCP process)

| Variable | Description |
|----------|-------------|
| `CURSOR_MCP_BRIDGE_SESSION` | Session id string (e.g. `1`), required for multi-session; legacy `SIDECAR_MCP_SESSION`, `WUKONG_SESSION` still read |
| `CURSOR_MCP_BRIDGE_CHECK_MAX_WAIT_MS` | Max wait in ms when `check_messages` has an empty queue (default `20000`); legacy `SIDECAR_MCP_CHECK_MAX_WAIT_MS`, `WUKONG_CHECK_MAX_WAIT_MS` still read |

## License

MIT — see [`extension/LICENSE.txt`](extension/LICENSE.txt).

### Local folder name

You can name the cloned repo folder **`cursor-mcp-bridge`** on disk (purely cosmetic). If rename fails with “file in use”, close this workspace in the editor (or exit the app), rename the folder in Explorer, then reopen it.

---

# Cursor MCP Bridge（中文说明）

用于 **Cursor / VS Code** 的扩展（包名 **`cursor-mcp-bridge`**）：在侧栏管理多路 **Model Context Protocol（MCP）** 会话，让插件侧与 Cursor 对话通过 `check_messages` 等工具交换消息（文字、截图、附件）。

## 功能概要

- 多路会话（默认最多 32 路），对应 Cursor 配置中的 `my-mcp-1` … `my-mcp-N`
- 一键写入工作区 `.cursor/mcp.json` 与规则文件
- 可选备忘、富消息（图片与文件）

**使用说明（安装、配置工作区、绑定 `my-mcp-N`、发消息、常见问题）** 见 [`extension/readme.md`](extension/readme.md) 中的「使用说明（必读）」一节。实现与路径说明见 [`extension/docs/project-overview.md`](extension/docs/project-overview.md)。

## 开发与打包

```bash
cd extension
npm install
npm run compile   # 若仓库含 TypeScript 源码
npm run package   # 生成 .vsix（需已安装 vsce）
```

当前主入口为 `extension/dist/extension.js`。修改 MCP 行为请编辑 `extension/mcp-server/index.mjs`。

## 环境变量（MCP 进程）

| 变量 | 说明 |
|------|------|
| `CURSOR_MCP_BRIDGE_SESSION` | 会话编号字符串（如 `1`），多路时必填；旧名 `SIDECAR_MCP_SESSION`、`WUKONG_SESSION` 仍兼容 |
| `CURSOR_MCP_BRIDGE_CHECK_MAX_WAIT_MS` | `check_messages` 空队列时最长等待毫秒数，默认 20000；旧名 `SIDECAR_MCP_CHECK_MAX_WAIT_MS`、`WUKONG_CHECK_MAX_WAIT_MS` 仍兼容 |

## 许可证

MIT — 见 [`extension/LICENSE.txt`](extension/LICENSE.txt)。

## 本地文件夹名称

建议将仓库所在目录命名为 **`cursor-mcp-bridge`**（与扩展包名一致，仅便于识别）。若提示「文件正在使用」无法重命名，请先在 Cursor / VS Code 中 **关闭该文件夹工作区** 或退出程序，再在资源管理器中重命名，然后重新打开。
