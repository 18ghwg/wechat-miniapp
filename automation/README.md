# 微信小程序自动化 - 浏览器工具方法

## 🎯 使用方法

### 手动启动（推荐）

每次打开 Cursor 时，需要手动运行两个命令：

#### 步骤 1：启动 Browser Tools Server

在 Cursor 中打开**第一个终端**，运行：

```bash
cd 微信Flask-小程序
npx @agentdeskai/browser-tools-server
```

等待服务启动，你会看到：

```
=== Browser Tools Server Started ===
Aggregator listening on http://0.0.0.0:3025
For local access use: http://localhost:3025
```

#### 步骤 2：启动 Browser Tools MCP

在 Cursor 中打开**第二个终端**（点击 + 号新建终端），运行：

```bash
cd 微信Flask-小程序
npx @agentdeskai/browser-tools-mcp
```

### ⚠️ 重要提示

- **保持两个终端窗口打开**，不要关闭
- **每次打开 Cursor 都需要重新运行这两个命令**
- 第一个命令运行在**终端 1**
- 第二个命令运行在**终端 2**

### 🛑 停止服务

在每个终端中按 `Ctrl+C` 停止对应的服务。

## 📦 可选：使用 npm 脚本

也可以使用 npm 脚本启动（需要分别在两个终端运行）：

**终端 1:**
```bash
npm run browser-tools:server
```

**终端 2:**
```bash
npm run browser-tools:mcp
```

## 📊 服务信息

- **Browser Tools Server 端口**: 3025
- **本地访问地址**: http://localhost:3025
- **网络访问地址**: http://[你的IP]:3025

## 💡 工作流程

1. 打开 Cursor
2. 新建终端，运行第一个命令（Server）
3. 再新建一个终端，运行第二个命令（MCP）
4. 保持两个终端打开
5. 开始使用自动化功能
6. 工作完成后，在两个终端分别按 `Ctrl+C` 停止

## 🔧 故障排除

### 问题：端口被占用

如果看到 "Port 3025 is already in use"：

1. 检查是否已经启动了服务
2. 在任务管理器中结束 node.exe 进程
3. 重新运行命令

### 问题：命令未找到

确保已安装 Node.js 并且 npx 可用：

```bash
node --version
npx --version
```

## 📝 简化操作

为了方便，建议：

1. 将 Cursor 配置为启动时自动打开两个终端
2. 或者创建 Cursor 工作区，保存终端配置
3. 使用 Cursor 的命令历史快速执行

就这么简单！🎉
