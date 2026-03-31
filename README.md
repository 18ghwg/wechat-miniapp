# 微信小程序 - 电费管理与考勤系统

基于 TDesign 组件库开发的企业管理小程序，包含电费管理、考勤打卡等功能模块。

## 功能模块

### 1. 电费管理
- 电表账户管理
- 电费查询与统计
- 用电数据展示
- 账户绑定与解绑

### 2. 考勤系统
- 每日打卡签到
- 考勤记录查询
- 补卡申请
- 考勤统计

### 3. 用户中心
- 个人信息管理
- 登录认证
- 权限控制

## 技术栈

- 微信小程序原生框架
- TDesign 微信小程序组件库
- JavaScript + WXSS
- Day.js 时间处理
- Crypto-js 加密

## 项目结构

```
├── pages/                  # 页面目录
│   ├── attendance/        # 考勤模块
│   ├── electric/          # 电费管理模块
│   ├── login/             # 登录页面
│   └── usercenter/        # 用户中心
├── components/            # 自定义组件
├── utils/                 # 工具函数
│   └── api.js            # API 接口配置
├── config/               # 配置文件
├── custom-tab-bar/       # 自定义底部导航
└── app.js                # 小程序入口
```

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 配置后端接口
编辑 `utils/api.js` 文件，修改 API 地址：
```javascript
const BASE_URL = 'your-backend-url';
```

3. 微信开发者工具导入项目

4. 构建 npm 包
工具 -> 构建 npm

5. 运行预览

## 配置说明

### API 配置
在 `utils/api.js` 中配置后端接口地址和相关参数。

### 权限配置
小程序需要以下权限：
- 网络请求
- 用户信息
- 位置信息（考勤打卡）

## 最低基础库版本

`^2.6.5`

## 开源协议

MIT License
