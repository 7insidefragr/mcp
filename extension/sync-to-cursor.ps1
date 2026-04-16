$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $projectRoot "dist\extension.js"

if (!(Test-Path $src)) {
  throw "找不到源码产物：$src。请先运行 `npm run compile` 或 `npm run watch` 生成 dist。"
}

$extBase = Join-Path $env:USERPROFILE '.cursor/extensions'

# 依赖你当前开发期间不改 publisher/name/version；这样 Cursor 安装目录名会稳定
$folder = Get-ChildItem -Path $extBase -Directory |
  Where-Object { $_.Name -like "my.cursor-my-ui-ext-*" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $folder) {
  throw "在 $extBase 下找不到已安装扩展目录（期望匹配 my.cursor-my-ui-ext-*）。请先把 .vsix 安装到 Cursor。"
}

$dst = Join-Path $folder.FullName "dist\extension.js"

Copy-Item -Path $src -Destination $dst -Force
Write-Output "已同步：$src -> $dst"

