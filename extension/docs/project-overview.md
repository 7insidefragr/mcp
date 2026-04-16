# Cursor MCP Bridge — 项目说明

本仓库为 **Cursor / VS Code 扩展**（包名 `cursor-mcp-bridge`）：在侧栏管理多路 MCP 会话，通过本地队列与 Cursor 对话中的 `check_messages` 等工具同步消息。

## 组成

- **`extension/`**：扩展宿主与 Webview UI；「开始配置」会将 `mcp-server` 复制到用户目录并写入 `.cursor/mcp.json`。
- **`extension/mcp-server/`**：基于 `@modelcontextprotocol/sdk` 的 stdio MCP 进程，提供 `check_messages` 等工具。

## MCP 与队列路径

- 消息队列根目录：`~/.cursor/my-mcp-messages`（多会话时在 `s/<会话号>/` 下）。
- 多会话由环境变量 **`CURSOR_MCP_BRIDGE_SESSION`** 标识通道；旧名 **`SIDECAR_MCP_SESSION`**、**`WUKONG_SESSION`** 仍被服务端识别，便于迁移。

## `check_messages` 与 long-poll

与 **wukong-mcp 1.4.0** 一致：队列为空时，工具在**单次调用内**按约 **1 秒**间隔读盘睡眠并循环，直到队列出现新消息或调用被取消；**不设超时返回**，以便 Cursor 在同一次 `check_messages` 上持续阻塞监听插件。

## 许可证

以仓库根目录及 `extension/LICENSE.txt` 为准（MIT）。
