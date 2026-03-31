# 微信小程序自动化 - 浏览器工具方法

## 🎯 新方法说明

使用 `@agentdeskai/browser-tools` 和浏览器插件来控制小程序。

## 📋 系统要求

- ✅ Node.js 已安装
- ✅ 浏览器插件已安装（AgentDesk Browser Tools）
- ✅ 微信开发者工具已安装

## 🚀 快速开始

### 方式一：使用批处理文件（推荐，Windows）

双击运行：
```
微信Flask-小程序\automation\启动浏览器工具.cmd
```

这会自动打开两个命令行窗口：
1. **Browser Tools Server** - 运行在端口 3025
2. **Browser Tools MCP** - MCP 服务

### 方式二：使用 PowerShell 脚本

在 PowerShell 或 Cursor 终端中运行：
```powershell
cd 微信Flask-小程序
.\automation\启动浏览器工具.ps1
```

### 方式三：手动启动（Cursor 终端）

**步骤 1：** 在 Cursor 中打开第一个终端，运行：
```bash
cd 微信Flask-小程序
npx @agentdeskai/browser-tools-server
```

**步骤 2：** 在 Cursor 中新建第二个终端，运行：
```bash
cd 微信Flask-小程序
npx @agentdeskai/browser-tools-mcp
```

**重要：** 保持这两个终端窗口打开，不要关闭！

## 📊 服务状态

启动成功后，你会看到：

### Browser Tools Server
```
=== Browser Tools Server Started ===
Aggregator listening on http://0.0.0.0:3025
Available on the following network addresses:
  - http://192.168.x.x:3025
For local access use: http://localhost:3025
```

### Browser Tools MCP
MCP 服务会连接到 Server 并提供自动化接口。

## 🔧 使用方法

1. **启动服务**（使用上述任一方式）

2. **打开浏览器**，确保已安装 AgentDesk Browser Tools 插件

3. **连接到服务**
   - 插件会自动连接到 `http://localhost:3025`
   
4. **在 Cursor 中使用 MCP 功能**
   - 使用 `@browser-tools` 工具
   - 可以控制浏览器和小程序

## 🛑 停止服务

### 方法一：关闭窗口
直接关闭 Browser Tools Server 和 Browser Tools MCP 的窗口

### 方法二：使用停止脚本
运行：
```
微信Flask-小程序\automation\停止浏览器工具.cmd
```

### 方法三：任务管理器
在任务管理器中找到并结束相关的 node.exe 进程

## 📂 文件说明

```
automation/
├── 启动浏览器工具.cmd        # 一键启动脚本（Windows）
├── 启动浏览器工具.ps1        # PowerShell 启动脚本
├── 停止浏览器工具.cmd        # 停止服务脚本
├── start-browser-tools.cmd   # 只启动 Server
├── 安装依赖.cmd              # 安装依赖包
└── README-新方法.md          # 本文档
```

## 🔍 故障排除

### 问题：PowerShell 执行策略错误

**错误信息：** "在此系统上禁止运行脚本"

**解决方法：** 使用批处理文件（.cmd）而不是 PowerShell 脚本

### 问题：端口已被占用

**错误信息：** "Port 3025 is already in use"

**解决方法：**
1. 检查是否已经启动了服务
2. 在任务管理器中结束占用端口的进程
3. 或者修改配置使用其他端口

### 问题：npx 命令失败

**解决方法：**
1. 确保 Node.js 已正确安装
2. 运行 `npm install -g npx` 安装 npx
3. 重启终端

### 问题：无法连接到服务器

**解决方法：**
1. 确保 Browser Tools Server 已成功启动
2. 检查浏览器插件是否已安装并启用
3. 确认浏览器插件配置的地址是 `http://localhost:3025`

## 💡 提示

- ✅ 每次打开 Cursor 时都需要重新启动这两个服务
- ✅ 可以将启动脚本添加到快捷方式栏方便使用
- ✅ 如果长时间不使用，建议关闭服务以释放资源
- ✅ 服务启动需要几秒钟，请耐心等待

## 🎓 更多信息

- Browser Tools Server 端口: **3025**
- 本地访问地址: `http://localhost:3025`
- 网络访问地址: `http://[你的IP]:3025`

## 📝 下次使用

每次打开 Cursor 编辑器时：

1. 双击运行 `启动浏览器工具.cmd`
2. 等待两个服务启动完成
3. 开始使用自动化功能
4. 工作完成后可选择停止服务

就这么简单！🎉
