# Cursor MCP Bridge

在 **Cursor / VS Code** 侧栏管理多路 **MCP** 会话，与工作区内多个对话并行收发消息。

## 功能

- **多路会话**：侧栏添加/删除（1～32 路），每路对应 `my-mcp-N`
- **写入配置**：一键将当前路数写入 `.cursor/mcp.json` 并同步规则
- **并行通信**：插件发消息，在对应 Cursor 对话里通过 `check_messages` 拉取
- **富消息**：文字、**Ctrl+V 截图**、图片与文件附件
- **每路备忘**：为通道写备注，仅本机保存

## 使用说明（必读）

### 1. 安装扩展

- 在 Cursor / VS Code 中：**扩展 → 从 VSIX 安装**，选择打包好的 `cursor-mcp-bridge-x.x.x.vsix`；或在本仓库 `extension` 目录执行 `npm run package` 生成 VSIX 后安装。
- 安装后若侧栏未出现图标，执行 **Developer: Reload Window** 重载窗口。

### 2. 打开侧栏并配置工作区

1. 点击活动栏 **MCP Bridge**（活动栏图标为 `resources/icon.svg`；扩展市场/已安装列表中的「头像」为 `package.json` 的 `icon`：`resources/icon-128.png`）。
2. 在侧栏顶部选择要绑定的**工作区文件夹**（需已用 Cursor 打开该文件夹）。
3. 按需 **添加会话 / 删除会话**（每路对应 Cursor 里的一个 MCP 名称，如 `my-mcp-1`）。
4. 点击 **开始配置**：会向该工作区写入 `.cursor/mcp.json`（多路 `my-mcp-N`）以及 `.cursor/rules/` 下的规则文件，引导模型使用 `check_messages`。
5. **增删会话后务必再次点「开始配置」**，否则 Cursor 里 MCP 列表与侧栏不一致。

### 3. 在 Cursor 对话里绑定通道

- 打开（或新建）一个 Composer / Chat 窗口，在对话中明确要求使用与侧栏一致的 MCP，例如：  
  **`请使用 my-mcp-1 的 check_messages`**（数字与侧栏会话编号一致）。
- 在 Cursor **设置 → MCP** 中确认对应 `my-mcp-N` 已启用且无报错。

### 4. 从插件发消息到 Cursor

1. 在侧栏对应会话里输入文字，可选粘贴截图、添加附件。
2. 点击发送后，消息进入本机队列文件；Cursor 侧需在对话中通过 **`check_messages` 工具** 拉取（由规则与模型行为触发）。
3. 模型回复应主要写在 **Cursor 对话窗口**；默认不必把长文塞进工具的 `reply` 参数。

### 5. 常见问题

- **Cursor 没反应**：确认已配置 MCP、对话里已提到正确的 `my-mcp-N`，并尝试让助手再次调用 `check_messages`。
- **多窗口 / 多项目**：不同 Cursor 窗口可各绑一路 `my-mcp-N`，互不串台；每路队列目录见仓库内 `extension/docs/project-overview.md`。
- **空队列等待时间**：MCP 进程环境变量 `CURSOR_MCP_BRIDGE_CHECK_MAX_WAIT_MS` 控制 `check_messages` 在无消息时最长等待（默认 20000 ms），避免无限阻塞。

## 快速开始（摘要）

1. 安装扩展并重载窗口。  
2. 活动栏打开 **MCP Bridge** → 选工作区 → **开始配置**。  
3. 在 Cursor 对话中：**`请使用 my-mcp-N 的 check_messages`**（N 与侧栏一致）。

## 许可证

MIT（见 `LICENSE.txt`）。
