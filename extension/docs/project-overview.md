# 侧栏 MCP — 项目说明

本仓库为 **Cursor / VS Code 扩展**：在侧栏管理多路 MCP 会话，通过本地队列与 Cursor 对话中的 `check_messages` 等工具同步消息。

## 组成

- **`extension/`**：扩展宿主与 Webview UI；「开始配置」会将 `mcp-server` 复制到用户目录并写入 `.cursor/mcp.json`。
- **`extension/mcp-server/`**：基于 `@modelcontextprotocol/sdk` 的 stdio MCP 进程，提供 `check_messages` 等工具。

## MCP 与队列路径

- 消息队列根目录：`~/.cursor/my-mcp-messages`（多会话时在 `s/<会话号>/` 下）。
- 多会话由环境变量 **`SIDECAR_MCP_SESSION`** 标识通道（旧名 `WUKONG_SESSION` 仍被服务端识别，便于迁移）。

## `check_messages` 与超时

空队列时工具会轮询等待，但设有**最长等待时间**（默认约 20 秒），避免 Cursor Agent 长时间卡在单次工具调用上。可通过 **`SIDECAR_MCP_CHECK_MAX_WAIT_MS`** 调节（旧名 `WUKONG_CHECK_MAX_WAIT_MS` 仍兼容）。

## 许可证

以仓库根目录及 `extension/LICENSE.txt` 为准（MIT）。
