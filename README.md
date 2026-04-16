# Cursor MCP Bridge

用于 **Cursor / VS Code** 的扩展（包名 **`cursor-mcp-bridge`**）：在侧栏管理多路 **Model Context Protocol（MCP）** 会话，让插件侧与 Cursor 对话通过 `check_messages` 等工具交换消息（文字、截图、附件）。

## 功能概要

- 多路会话（默认最多 32 路），对应 Cursor 配置中的 `my-mcp-1` … `my-mcp-N`
- 一键写入工作区 `.cursor/mcp.json` 与规则文件
- 可选备忘、富消息（图片与文件）

详细说明见 [`extension/readme.md`](extension/readme.md)；实现与路径说明见 [`extension/docs/project-overview.md`](extension/docs/project-overview.md)。

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
