# Cursor MCP Bridge

在 **Cursor / VS Code** 侧栏管理多路 **MCP** 会话，与工作区内多个对话并行收发消息。

## 功能

- **多路会话**：侧栏添加/删除（1～32 路），每路对应 `my-mcp-N`
- **写入配置**：一键将当前路数写入 `.cursor/mcp.json` 并同步规则
- **并行通信**：插件发消息，在对应 Cursor 对话里通过 `check_messages` 拉取
- **富消息**：文字、**Ctrl+V 截图**、图片与文件附件
- **每路备忘**：为通道写备注，仅本机保存

## 快速开始

1. 在 Cursor / VS Code 中加载本扩展（从 `extension` 目录 **Install from VSIX** 或 **Run Extension**）。
2. 点击活动栏 **MCP Bridge**（扩展名：Cursor MCP Bridge）。
3. 选择工作区，点 **开始配置**。
4. 在 Cursor 对话中使用：**`请使用 my-mcp-N 的 check_messages`**（N 与侧栏通道一致）。

## 许可证

MIT（见 `LICENSE.txt`）。
