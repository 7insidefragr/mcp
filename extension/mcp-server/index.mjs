#!/usr/bin/env node
/**
 * 最小 MCP Server：check_messages 读取扩展发送的消息，send_message 接收文本/图片
 * 运行：node index.mjs
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// 多会话：CURSOR_MCP_BRIDGE_SESSION=1…32 时队列为 ~/.cursor/my-mcp-messages/s/<id>/
// 兼容旧名 SIDECAR_MCP_SESSION、WUKONG_SESSION；未设置时保持旧路径（兼容单实例 my-mcp）
import { homedir } from "os";
const queueRoot = join(homedir(), ".cursor", "my-mcp-messages");
const sessionKey = (
  process.env.CURSOR_MCP_BRIDGE_SESSION ||
  process.env.SIDECAR_MCP_SESSION ||
  process.env.WUKONG_SESSION ||
  ""
).trim();
const queueDir = sessionKey ? join(queueRoot, "s", sessionKey) : queueRoot;
const queuePath = join(queueDir, "messages.json");

function readQueue() {
  try {
    if (existsSync(queuePath)) {
      const raw = readFileSync(queuePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return { messages: [] };
}

function writeQueue(data) {
  if (!existsSync(queueDir)) mkdirSync(queueDir, { recursive: true });
  writeFileSync(queuePath, JSON.stringify(data, null, 2), "utf-8");
}

// 读取当前工作区路径（如果有）
function getWorkspaceInfo() {
  try {
    const infoPath = join(queueRoot, "workspace.json");
    if (existsSync(infoPath)) {
      const raw = readFileSync(infoPath, "utf-8");
      const data = JSON.parse(raw);
      return data.workspacePath || null;
    }
  } catch {}
  return null;
}

function buildSystemSuffix() {
  const workspace = getWorkspaceInfo();
  let suffix = "\n\n---\n[MANDATORY INSTRUCTION]\n";

  if (workspace) {
    suffix += `工作区：${workspace}\n\n`;
  }
  if (sessionKey) {
    suffix += `【会话通道】MCP-${sessionKey}：本进程仅处理插件发到该通道的消息；请在本对话中调用 my-mcp-${sessionKey} 的 check_messages。\n\n`;
  }

  suffix +=
    "以上是用户通过插件发来的**一条**消息（若连发多条会分多次送达）。\n\n" +
    "【必须先做】像平常聊天一样直接回应用户内容（寒暄、问答、任务等），不要用「工具已验证」「MCP 正常」等**代替真实回复**。\n" +
    "【禁止】用长篇解释插件/Cursor/通道原理来结束本轮；用户发「你好」就正常回「你好」类简短问候即可。\n\n" +
    "正文写在 Cursor 窗口；默认不要把长文塞进 reply。\n\n" +
    "与插件持续对话时：处理完本条后应再次调用 check_messages（reply 可省略）以取下一条；队列空时工具会在约 " +
    Math.round(getCheckMaxWaitMs() / 1000) +
    " 秒内返回，不会永久卡住 Cursor。\n" +
    "[END]";

  return suffix;
}

const POLL_INTERVAL_MS = 1000;

// 避免单次工具调用永不返回导致 Cursor/Agent 卡在「等 MCP」；可用环境变量调节
const DEFAULT_CHECK_MAX_WAIT_MS = 20_000;
const MIN_CHECK_MAX_WAIT_MS = 3_000;
const MAX_CHECK_MAX_WAIT_MS = 120_000;

function getCheckMaxWaitMs() {
  const raw = (
    process.env.CURSOR_MCP_BRIDGE_CHECK_MAX_WAIT_MS ||
    process.env.SIDECAR_MCP_CHECK_MAX_WAIT_MS ||
    process.env.WUKONG_CHECK_MAX_WAIT_MS ||
    ""
  ).trim();
  if (!raw) return DEFAULT_CHECK_MAX_WAIT_MS;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_CHECK_MAX_WAIT_MS;
  return Math.min(MAX_CHECK_MAX_WAIT_MS, Math.max(MIN_CHECK_MAX_WAIT_MS, Math.round(n)));
}

function sleepWithAbort(signal, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(true), ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve(false);
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

const serverName = sessionKey ? `my-mcp-${sessionKey}` : "my-mcp";
const server = new McpServer({ name: serverName, version: "0.1.0" });

// Cursor 调用此工具获取你在扩展里发送的消息
server.registerTool(
  "check_messages",
  {
    title: "检查消息（持续对话）",
    description:
      "【持续对话】获取用户通过插件发送的消息。助手正文应只在 Cursor 对话里输出。" +
      "若队列暂无消息，会在约 " +
      Math.round(getCheckMaxWaitMs() / 1000) +
      " 秒内返回（可用环境变量 CURSOR_MCP_BRIDGE_CHECK_MAX_WAIT_MS 调节；旧名 SIDECAR_* / WUKONG_* 仍兼容），避免阻塞 Cursor。" +
      "需要等插件下一条时再调用；默认不传 reply（不向插件镜像助手回复）。",
    inputSchema: z.object({
      reply: z
        .string()
        .optional()
        .describe("可选。仅非空时才会写入插件侧；默认省略，用户只在 Cursor 看完整回复"),
    }),
  },
  async ({ reply }, extra) => {
    const replyTrimmed = typeof reply === "string" ? reply.trim() : "";
    if (replyTrimmed) {
      try {
        const replyFile = join(queueDir, "reply.json");
        writeFileSync(
          replyFile,
          JSON.stringify({ reply: replyTrimmed, timestamp: new Date().toISOString() }, null, 2),
          "utf-8"
        );
      } catch {
        // ignore
      }
    }

    const deadline = Date.now() + getCheckMaxWaitMs();

    // 带超时的轮询：有消息立刻返回；无消息最多等到 deadline，避免 Agent 永久卡在工具调用上
    while (!extra.signal.aborted) {
      const data = readQueue();
      const queued = Array.isArray(data.messages) ? data.messages : [];

      if (queued.length > 0) {
        // 每次只取一条，避免多条「你好」合并后模型只讲机制、不聊天
        const first = queued[0];
        const rest = queued.slice(1);
        writeQueue({ messages: rest });

        const textPieces = [];
        const imageParts = [];

        const m = first;
        if (typeof m.text === "string" && m.text.trim()) {
          textPieces.push(m.text.trim());
        }
        if (Array.isArray(m.images)) {
          for (const img of m.images) {
            if (img?.mimeType && img?.data) {
              imageParts.push({ mimeType: String(img.mimeType), data: String(img.data) });
            }
          }
        }
        if (Array.isArray(m.files)) {
          for (const f of m.files) {
            if (!f?.name || !f?.mimeType || !f?.data) continue;
            const name = String(f.name);
            const mt = String(f.mimeType);
            const b64 = String(f.data).replace(/\s/g, "");
            if (mt.startsWith("image/")) {
              imageParts.push({ mimeType: mt, data: b64 });
              continue;
            }
            const textLike =
              mt.startsWith("text/") ||
              mt === "application/json" ||
              mt === "application/javascript" ||
              mt.endsWith("+json") ||
              mt.endsWith("+xml");
            if (textLike) {
              try {
                const body = Buffer.from(b64, "base64").toString("utf8");
                textPieces.push(`【附件: ${name}】\n${body}`);
              } catch {
                textPieces.push(`【附件: ${name}】（文本解码失败）`);
              }
            } else {
              textPieces.push(
                `【二进制附件: ${name} (${mt})，Base64 如下】\n${b64}`
              );
            }
          }
        }

        const content = [];
        const systemSuffix = buildSystemSuffix();
        const mainText = textPieces.join("\n\n");
        if (mainText) {
          content.push({
            type: "text",
            text: mainText + systemSuffix,
          });
        } else if (imageParts.length > 0) {
          content.push({
            type: "text",
            text: "（收到来自插件的图片/附件，无文字说明）" + systemSuffix,
          });
        } else {
          content.push({
            type: "text",
            text: "（收到来自插件的消息）" + systemSuffix,
          });
        }

        for (const img of imageParts) {
          content.push({
            type: "image",
            mimeType: img.mimeType,
            data: img.data,
          });
        }

        return { content };
      }

      if (Date.now() >= deadline) {
        return {
          content: [
            {
              type: "text",
              text:
                "[system] 暂无来自插件的新消息（本轮等待已达上限）。若仍需监听插件，请稍后再调用 check_messages；否则继续处理 Cursor 里的任务即可。",
            },
          ],
        };
      }

      const remaining = deadline - Date.now();
      const sleepMs = Math.min(POLL_INTERVAL_MS, Math.max(1, remaining));
      await sleepWithAbort(extra.signal, sleepMs);
    }

    return {
      content: [
        {
          type: "text",
          text: "[system] check_messages 等待被取消，结束本轮。",
        },
      ],
      isError: true,
    };
  }
);

// 仿照 CursorForge 的 ask_question
server.registerTool(
  "ask_question",
  {
    title: "提问",
    description: "向用户提问，获取用户输入",
    inputSchema: z.object({
      question: z.string().describe("要问用户的问题"),
    }),
  },
  async ({ question }) => {
    const data = readQueue();
    const texts = data.messages?.map((m) => m.text).filter(Boolean) ?? [];
    const userReply = texts.length ? texts[0] : "用户暂无回复";
    return { content: [{ type: "text", text: `问题：${question}\n用户回复：${userReply}` }] };
  }
);

server.registerTool(
  "send_message",
  {
    title: "发送消息",
    description: "接收文本和可选图片，返回简单确认",
    inputSchema: z.object({
      text: z.string().describe("用户输入的文本"),
      images: z
        .array(
          z.object({
            mimeType: z.string().describe("图片 MIME 类型，如 image/png"),
            data: z.string().describe("图片 base64 数据"),
          })
        )
        .optional()
        .describe("可选图片列表"),
    }),
  },
  async ({ text, images }) => {
    const imgCount = images?.length ?? 0;
    const reply = `已收到：${text}${imgCount > 0 ? `，图片 ${imgCount} 张` : ""}`;
    return { content: [{ type: "text", text: reply }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
