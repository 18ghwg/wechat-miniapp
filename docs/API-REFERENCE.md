# API接口文档

> 微信小程序后端API接口完整参考文档
> 
> 最后更新：2026-03-31

## 目录

- [1. 用户认证模块](#1-用户认证模块)
- [2. 用户信息模块](#2-用户信息模块)
- [3. 系统配置模块](#3-系统配置模块)
- [4. 电费查询模块](#4-电费查询模块)
- [5. 国网账号模块](#5-国网账号模块)
- [6. 考勤管理模块](#6-考勤管理模块)
- [7. 公告管理模块](#7-公告管理模块)
- [8. 意见反馈模块](#8-意见反馈模块)
- [9. 小程序用户管理模块](#9-小程序用户管理模块)
- [10. 定时任务管理模块](#10-定时任务管理模块)
- [11. 使用记录管理模块](#11-使用记录管理模块)
- [12. 天气通知模块](#12-天气通知模块)
- [13. 天气严重程度模块](#13-天气严重程度模块)
- [14. 电费通知模块](#14-电费通知模块)
- [15. 位置搜索模块](#15-位置搜索模块)

## 通用说明

### 请求头

所有接口都需要以下请求头：

| 请求头 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| X-Wechat-Openid | string | 是 | 用户openid（登录接口除外） |
| X-Timestamp | string | 是 | 请求时间戳 |
| X-Signature | string | 是 | 请求签名 |
| Content-Type | string | 是 | application/json（POST/PUT请求） |

### 响应格式

所有接口统一返回格式：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

**状态码说明**：
- `200` - 成功
- `401` - 未授权/需要登录
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器错误

---

## 1. 用户认证模块

### 1.1 微信登录

**接口路径**: `POST /api/wechat/auth/login`

**功能描述**: 使用微信code和用户信息进行登录

**调用页面**: 
- pages/login/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 微信登录凭证 |
| userInfo | object | 是 | 用户信息对象 |
| userInfo.nickName | string | 是 | 用户昵称 |
| userInfo.avatarUrl | string | 是 | 用户头像URL |

**请求示例**:
```javascript
API.auth.login(code, {
  nickName: '张三',
  avatarUrl: 'https://...'
})
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "userInfo": {
      "nickName": "张三",
      "avatarUrl": "https://..."
    }
  }
}
```

---

### 1.2 账号密码登录

**接口路径**: `POST /api/wechat/auth/account-login`

**功能描述**: 使用用户名和密码进行登录

**调用页面**: 
- pages/login/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| captcha_token | string | 否 | 验证码令牌 |

**请求示例**:
```javascript
API.auth.accountLogin('admin', 'password123', 'captcha_token')
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "userInfo": {
      "username": "admin",
      "real_name": "管理员"
    }
  }
}
```

---

### 1.3 绑定Web账号

**接口路径**: `POST /api/wechat/auth/bind`

**功能描述**: 将微信账号与Web账号绑定

**调用页面**: 
- pages/user/bind/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | Web账号用户名 |
| password | string | 是 | Web账号密码 |

**请求示例**:
```javascript
API.auth.bind('webuser', 'password123')
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "绑定成功",
  "data": {}
}
```

---

### 1.4 解绑Web账号

**接口路径**: `POST /api/wechat/auth/unbind`

**功能描述**: 解除微信账号与Web账号的绑定

**调用页面**: 
- pages/user/bind/index

**请求参数**: 无

**请求示例**:
```javascript
API.auth.unbind()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "解绑成功",
  "data": {}
}
```

---

## 2. 用户信息模块

### 2.1 获取用户信息

**接口路径**: `GET /api/wechat/user/info`

**功能描述**: 获取当前登录用户的详细信息

**调用页面**: 
- pages/usercenter/index
- pages/home/home
- pages/attendance/index
- pages/electric/index

**请求参数**: 无

**请求示例**:
```javascript
API.user.getInfo()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "real_name": "张三",
    "permissions": ["admin", "user"],
    "created_at": "2026-01-01 00:00:00"
  }
}
```

---

### 2.2 更新真实姓名

**接口路径**: `POST /api/wechat/user/update_real_name`

**功能描述**: 更新用户的真实姓名

**调用页面**: 
- pages/usercenter/index
- pages/attendance/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| real_name | string | 是 | 真实姓名 |

**请求示例**:
```javascript
API.user.updateRealName('张三')
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": {}
}
```

---

### 2.3 注销账号

**接口路径**: `POST /api/wechat/user/delete-account`

**功能描述**: 注销当前用户账号

**调用页面**: 
- pages/user/settings/index

**请求参数**: 无

**请求示例**:
```javascript
API.user.deleteAccount()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "账号已注销",
  "data": {}
}
```

---

### 2.4 调试用户权限

**接口路径**: `GET /api/wechat/user/debug-permissions`

**功能描述**: 获取用户权限调试信息（开发用）

**调用页面**: 
- pages/usercenter/index

**请求参数**: 无

**请求示例**:
```javascript
API.user.debugPermissions()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "permissions": ["admin", "user"],
    "roles": ["管理员"]
  }
}
```

---

## 3. 系统配置模块

### 3.1 获取系统配置

**接口路径**: `GET /api/wechat/system/config`

**功能描述**: 获取系统全局配置信息

**调用页面**: 
- app.js（应用启动时）

**请求参数**: 无

**请求示例**:
```javascript
API.system.getConfig()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "app_name": "无感tool",
    "version": "1.0.0",
    "features": {
      "attendance": true,
      "electric": true
    }
  }
}
```

---

### 3.2 健康检查

**接口路径**: `GET /api/wechat/system/health`

**功能描述**: 检查系统健康状态

**调用页面**: 
- 系统监控

**请求参数**: 无

**请求示例**:
```javascript
API.system.healthCheck()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "系统正常",
  "data": {
    "status": "healthy",
    "timestamp": "2026-03-31 21:55:00"
  }
}
```

---

## 4. 电费查询模块

### 4.1 查询电费

**接口路径**: `POST /api/wechat/electric/query`

**功能描述**: 查询当前用户绑定账号的电费信息（长超时接口）

**调用页面**: 
- pages/electric/index

**请求参数**: 无

**请求示例**:
```javascript
API.electric.query()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "query_result": {
      "balance": 100.50,
      "last_update": "2026-03-31 20:00:00"
    },
    "account_stats": {
      "account_count": 1,
      "household_count": 2
    }
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "msg": "未绑定户号",
  "data": {
    "error_type": "no_households"
  }
}
```

---

### 4.2 获取电费历史记录

**接口路径**: `GET /api/wechat/electric/history`

**功能描述**: 获取电费查询历史记录

**调用页面**: 
- pages/electric/index
- pages/electric/history/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| grid_account | string | 否 | 国网账号（筛选） |
| room | string | 否 | 房间号（筛选） |
| year | number | 否 | 年份 |
| month | number | 否 | 月份 |
| is_admin_request | boolean | 否 | 是否管理员请求 |

**请求示例**:
```javascript
API.electric.getHistory({
  year: 2026,
  month: 3
})
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "balance": 100.50,
      "query_time": "2026-03-31 20:00:00",
      "grid_account": "13800138000",
      "room": "101"
    }
  ]
}
```

---

### 4.3 获取账号统计信息

**接口路径**: `GET /api/wechat/electric/account-stats`

**功能描述**: 获取电费账号统计信息（管理员功能）

**调用页面**: 
- pages/electric/index

**请求参数**: 无

**请求示例**:
```javascript
API.electric.getAccountStats()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "account_count": 10,
    "household_count": 25,
    "active_count": 8
  }
}
```

---

### 4.4 获取管理员账号选项

**接口路径**: `GET /api/wechat/electric/admin-account-options`

**功能描述**: 获取所有国网账号选项（管理员权限）

**调用页面**: 
- pages/electric/history/index

**请求参数**: 无

**请求示例**:
```javascript
API.electric.getAdminAccountOptions()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "value": "13800138000",
      "label": "13800138000"
    }
  ]
}
```

---

### 4.5 获取用户户号选项

**接口路径**: `GET /api/wechat/electric/user-account-options`

**功能描述**: 获取当前用户的户号选项

**调用页面**: 
- pages/electric/history/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| grid_account | string | 否 | 国网账号 |

**请求示例**:
```javascript
API.electric.getUserAccountOptions({ grid_account: '13800138000' })
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "value": "101",
      "label": "101室"
    }
  ]
}
```

---

### 4.6 获取管理员房间选项

**接口路径**: `GET /api/wechat/electric/admin-room-options`

**功能描述**: 获取指定账号下的房间选项（管理员权限）

**调用页面**: 
- pages/electric/history/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| grid_account | string | 是 | 国网账号 |

**请求示例**:
```javascript
API.electric.getAdminRoomOptions({ grid_account: '13800138000' })
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "value": "101",
      "label": "101室"
    }
  ]
}
```

---

### 4.7 获取实体电表数据

**接口路径**: `GET /api/wechat/physical-meters`

**功能描述**: 获取实体电表的实时数据

**调用页面**: 
- pages/electric/index

**请求参数**: 无

**请
求示例**:
```javascript
API.electric.getPhysicalMeters()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "meter_name": "电表1",
      "current_reading": 1234.56,
      "today_kwh": 12.5,
      "last_update": "2026-03-31 21:00:00"
    }
  ]
}
```

---

## 5. 国网账号模块

### 5.1 获取国网账号列表

**接口路径**: `GET /api/wechat/grid/accounts`

**功能描述**: 获取当前用户绑定的国网账号列表

**调用页面**: 
- pages/electric/index
- pages/electric/account-manage/index
- pages/user/bind/index

**请求参数**: 无

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "phone_name": "13800138000",
      "account_name": "我的账号",
      "is_active": true
    }
  ]
}
```

---

### 5.2 绑定国网账号

**接口路径**: `POST /api/wechat/grid/accounts/bind`

**调用页面**: pages/electric/account-manage/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| grid_phone | string | 是 | 国网手机号 |
| grid_password | string | 是 | 国网密码 |
| account_name | string | 否 | 账号名称 |

---

### 5.3 解绑国网账号

**接口路径**: `DELETE /api/wechat/grid/accounts/{account_id}`

**调用页面**: pages/electric/account-manage/index

---

### 5.4 编辑国网账号

**接口路径**: `PUT /api/wechat/grid/accounts/{account_id}`

**调用页面**: pages/electric/account-manage/index

---

### 5.5 设置活跃账号

**接口路径**: `POST /api/wechat/grid/accounts/{account_id}/set-active`

**调用页面**: pages/electric/account-manage/index

---

### 5.6 检测电表IP

**接口路径**: `POST /api/wechat/grid/check-meter-ip`

**调用页面**: pages/electric/account-manage/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ip | string | 是 | 电表IP地址 |

---

## 6. 考勤管理模块

### 6.1 提交考勤

**接口路径**: `POST /api/wechat/attendance/submit`

**调用页面**: pages/attendance/index, pages/attendance/missing-checkin/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| work_date | string | 是 | 工作日期 YYYY-MM-DD |
| work_status | string | 是 | 工作状态 |
| comment | string | 否 | 备注 |
| business_trip_subsidy | number | 否 | 出差补贴 |

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "need_netdisk_info": false
  }
}
```

---

### 6.2 获取考勤历史

**接口路径**: `GET /api/wechat/attendance/history`

**调用页面**: pages/attendance/index, pages/attendance/history/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 姓名 |
| year | number | 否 | 年份 |
| month | number | 否 | 月份 |

---

### 6.3 获取今日考勤

**接口路径**: `GET /api/wechat/attendance/today`

**调用页面**: pages/attendance/index

---

### 6.4 更新考勤

**接口路径**: `PUT /api/wechat/attendance/{id}`

**调用页面**: pages/attendance/history/index

---

### 6.5 删除考勤

**接口路径**: `DELETE /api/wechat/attendance/{id}`

**调用页面**: pages/attendance/history/index

---

### 6.6 获取网盘信息

**接口路径**: `GET /api/wechat/attendance/netdisk-info`

**调用页面**: pages/attendance/netdisk/index

---

### 6.7 更新网盘信息

**接口路径**: `POST /api/wechat/attendance/netdisk-info`

**调用页面**: pages/attendance/netdisk/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_name | string | 是 | 用户名 |
| password | string | 是 | 密码 |

---

### 6.8 上传到网盘

**接口路径**: `POST /api/wechat/attendance/upload-to-netdisk`

**调用页面**: pages/attendance/missing-checkin/index

---

## 7. 公告管理模块

### 7.1 获取公告列表

**接口路径**: `GET /api/wechat/announcement/list`

**调用页面**: pages/usercenter/index

---

### 7.2 管理员获取所有公告

**接口路径**: `GET /api/wechat/announcement/manage`

**调用页面**: pages/announcement/manage

---

### 7.3 创建公告

**接口路径**: `POST /api/wechat/announcement/create`

**调用页面**: pages/announcement/manage

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 公告标题 |
| content | string | 是 | 公告内容 |
| priority | string | 否 | 优先级 |

---

### 7.4 更新公告

**接口路径**: `PUT /api/wechat/announcement/update/{id}`

**调用页面**: pages/announcement/manage

---

### 7.5 删除公告

**接口路径**: `DELETE /api/wechat/announcement/delete/{id}`

**调用页面**: pages/announcement/manage

---

## 8. 意见反馈模块

### 8.1 获取反馈设置

**接口路径**: `GET /api/wechat/feedback/setting`

**调用页面**: pages/feedback/index

---

### 8.2 提交反馈

**接口路径**: `POST /api/wechat/feedback/submit`

**调用页面**: pages/feedback/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content | string | 是 | 反馈内容 |
| contact | string | 否 | 联系方式 |

---

## 9. 小程序用户管理模块

### 9.1 获取用户列表

**接口路径**: `GET /api/wechat/admin/miniprogram-users`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.2 创建用户

**接口路径**: `POST /api/wechat/admin/miniprogram-users`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.3 更新用户

**接口路径**: `PUT /api/wechat/admin/miniprogram-users/{user_id}`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.4 删除用户

**接口路径**: `DELETE /api/wechat/admin/miniprogram-users/{user_id}`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.5 获取用户权限

**接口路径**: `GET /api/wechat/admin/miniprogram-users/{user_id}/permissions`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.6 获取用户操作日志

**接口路径**: `GET /api/wechat/admin/miniprogram-users/{user_id}/operation-logs`

**调用页面**: pages/admin/miniprogram-users/index

---

## 10. 定时任务管理模块

### 10.1 获取任务列表

**接口路径**: `GET /api/wechat/admin/tasks`

**调用页面**: pages/admin/task-management/list/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| include_disabled | boolean | 否 | 是否包含禁用任务 |

---

### 10.2 获取任务详情

**接口路径**: `GET /api/wechat/admin/tasks/{task_id}`

**调用页面**: pages/admin/task-management/edit/index

---

### 10.3 更新任务配置

**接口路径**: `PUT /api/wechat/admin/tasks/{task_id}`

**调用页面**: pages/admin/task-management/edit/index

---

### 10.4 暂停任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/pause`

**调用页面**: pages/admin/task-management/list/index

---

### 10.5 恢复任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/resume`

**调用页面**: pages/admin/task-management/list/index

---

### 10.6 立即执行任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/run`

**调用页面**: pages/admin/task-management/list/index

---

### 10.7 获取任务执行状态

**接口路径**: `GET /api/wechat/admin/tasks/{task_id}/status`

**调用页面**: pages/admin/task-management/list/index

---

### 10.8 删除任务

**接口路径**: `DELETE /api/wechat/admin/tasks/{task_id}`

**调用页面**: pages/admin/task-management/list/index

---

### 10.9 获取任务日志

**接口路径**: `GET /api/wechat/admin/tasks/{task_id}/logs`

**调用页面**: pages/admin/task-management/logs/index

---

### 10.10 获取可用日志日期列表

**接口路径**: `GET /api/wechat/admin/logs/dates`

**调用页面**: pages/admin/task-management/logs/index

---

## 11. 使用记录管理模块

### 11.1 获取使用记录列表

**接口路径**: `GET /api/wechat/admin/usage-records`

**调用页面**: pages/admin/usage-records/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |
| feature_name | string | 否 | 功能名称 |

---

### 11.2 获取使用统计

**接口路径**: `GET /api/wechat/admin/usage-records/stats`

**调用页面**: pages/admin/usage-records/index

---

### 11.3 获取使用记录总数

**接口路径**: `GET /api/wechat/feature-usage/total-count`

**调用页面**: pages/admin/usage-records/index

---

### 11.4 清理旧的使用记录

**接口路径**: `POST /api/wechat/feature-usage/cleanup`

**调用页面**: pages/admin/usage-records/index

---

### 11.5 创建使用记录

**接口路径**: `POST /api/wechat/admin/usage-records`

**调用页面**: pages/admin/usage-records/index

---

### 11.6 更新使用记录

**接口路径**: `PUT /api/wechat/admin/usage-records/{id}`

**调用页面**: pages/admin/usage-records/index

---

### 11.7 删除使用记录

**接口路径**: `DELETE /api/wechat/admin/usage-records/{id}`

**调用页面**: pages/admin/usage-records/index

---

## 12. 天气通知模块

### 12.1 获取天气通知设置

**接口路径**: `GET /api/wechat/weather-notification-settings`

**调用页面**: pages/admin/weather-notification-settings/index

---

### 12.2 保存天气通知设置

**接口路径**: `POST /api/wechat/weather-notification-settings`

**调用页面**: pages/admin/weather-notification-settings/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| enabled | boolean | 是 | 是否启用 |
| city | string | 是 | 城市名称 |
| notify_time | string | 是 | 通知时间 |

---

## 13. 天气严重程度模块

### 13.1 获取严重程度配置

**接口路径**: `GET /api/wechat/weather-severity-config`

**调用页面**: pages/admin/weather-severity-settings/index

---

### 13.2 应用预设配置

**接口路径**: `POST /api/wechat/weather-severity-config/apply-preset`

**调用页面**: pages/admin/we
求示例**:
```javascript
API.electric.getPhysicalMeters()
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "meter_name": "电表1",
      "current_reading": 1234.56,
      "today_kwh": 12.5,
      "last_update": "2026-03-31 21:00:00"
    }
  ]
}
```

---

## 5. 国网账号模块

### 5.1 获取国网账号列表

**接口路径**: `GET /api/wechat/grid/accounts`

**调用页面**: pages/electric/index, pages/electric/account-manage/index

**请求参数**: 无

**响应数据**: 返回账号数组

---

### 5.2 绑定国网账号

**接口路径**: `POST /api/wechat/grid/accounts/bind`

**调用页面**: pages/electric/account-manage/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| grid_phone | string | 是 | 国网手机号 |
| grid_password | string | 是 | 国网密码 |
| account_name | string | 否 | 账号名称 |

---

### 5.3 解绑国网账号

**接口路径**: `DELETE /api/wechat/grid/accounts/{account_id}`

**调用页面**: pages/electric/account-manage/index

---

### 5.4 编辑国网账号

**接口路径**: `PUT /api/wechat/grid/accounts/{account_id}`

**调用页面**: pages/electric/account-manage/index

---

### 5.5 设置活跃账号

**接口路径**: `POST /api/wechat/grid/accounts/{account_id}/set-active`

**调用页面**: pages/electric/account-manage/index

---

### 5.6 检测电表IP

**接口路径**: `POST /api/wechat/grid/check-meter-ip`

**调用页面**: pages/electric/account-manage/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ip | string | 是 | 电表IP地址 |

---

## 6. 考勤管理模块

### 6.1 提交考勤

**接口路径**: `POST /api/wechat/attendance/submit`

**调用页面**: pages/attendance/index, pages/attendance/missing-checkin/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| work_date | string | 是 | 工作日期 YYYY-MM-DD |
| work_status | string | 是 | 工作状态 |
| comment | string | 否 | 备注 |
| business_trip_subsidy | number | 否 | 出差补贴 |

---

### 6.2 获取考勤历史

**接口路径**: `GET /api/wechat/attendance/history`

**调用页面**: pages/attendance/index, pages/attendance/history/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 姓名 |
| year | number | 否 | 年份 |
| month | number | 否 | 月份 |

---

### 6.3 获取今日考勤

**接口路径**: `GET /api/wechat/attendance/today`

**调用页面**: pages/attendance/index

---

### 6.4 更新考勤

**接口路径**: `PUT /api/wechat/attendance/{id}`

**调用页面**: pages/attendance/history/index

---

### 6.5 删除考勤

**接口路径**: `DELETE /api/wechat/attendance/{id}`

**调用页面**: pages/attendance/history/index

---

### 6.6 获取网盘信息

**接口路径**: `GET /api/wechat/attendance/netdisk-info`

**调用页面**: pages/attendance/netdisk/index

---

### 6.7 更新网盘信息

**接口路径**: `POST /api/wechat/attendance/netdisk-info`

**调用页面**: pages/attendance/netdisk/index

---

### 6.8 上传到网盘

**接口路径**: `POST /api/wechat/attendance/upload-to-netdisk`

**调用页面**: pages/attendance/missing-checkin/index

---

## 7. 公告管理模块

### 7.1 获取公告列表

**接口路径**: `GET /api/wechat/announcement/list`

**调用页面**: pages/usercenter/index

---

### 7.2 管理员获取所有公告

**接口路径**: `GET /api/wechat/announcement/manage`

**调用页面**: pages/announcement/manage

---

### 7.3 创建公告

**接口路径**: `POST /api/wechat/announcement/create`

**调用页面**: pages/announcement/manage

---

### 7.4 更新公告

**接口路径**: `PUT /api/wechat/announcement/update/{id}`

**调用页面**: pages/announcement/manage

---

### 7.5 删除公告

**接口路径**: `DELETE /api/wechat/announcement/delete/{id}`

**调用页面**: pages/announcement/manage

---

## 8. 意见反馈模块

### 8.1 获取反馈设置

**接口路径**: `GET /api/wechat/feedback/setting`

**调用页面**: pages/feedback/index

---

### 8.2 提交反馈

**接口路径**: `POST /api/wechat/feedback/submit`

**调用页面**: pages/feedback/index

---

## 9. 小程序用户管理模块

### 9.1 获取用户列表

**接口路径**: `GET /api/wechat/admin/miniprogram-users`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.2 创建用户

**接口路径**: `POST /api/wechat/admin/miniprogram-users`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.3 更新用户

**接口路径**: `PUT /api/wechat/admin/miniprogram-users/{user_id}`

**调用页面**: pages/admin/miniprogram-users/index

---

### 9.4 删除用户

**接口路径**: `DELETE /api/wechat/admin/miniprogram-users/{user_id}`

**调用页面**: pages/admin/miniprogram-users/index

---

## 10. 定时任务管理模块

### 10.1 获取任务列表

**接口路径**: `GET /api/wechat/admin/tasks`

**调用页面**: pages/admin/task-management/list/index

---

### 10.2 获取任务详情

**接口路径**: `GET /api/wechat/admin/tasks/{task_id}`

**调用页面**: pages/admin/task-management/edit/index

---

### 10.3 更新任务配置

**接口路径**: `PUT /api/wechat/admin/tasks/{task_id}`

**调用页面**: pages/admin/task-management/edit/index

---

### 10.4 暂停任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/pause`

**调用页面**: pages/admin/task-management/list/index

---

### 10.5 恢复任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/resume`

**调用页面**: pages/admin/task-management/list/index

---

### 10.6 立即执行任务

**接口路径**: `POST /api/wechat/admin/tasks/{task_id}/run`

**调用页面**: pages/admin/task-management/list/index

---

### 10.7 获取任务日志

**接口路径**: `GET /api/wechat/admin/tasks/{task_id}/logs`

**调用页面**: pages/admin/task-management/logs/index

---

## 11. 使用记录管理模块

### 11.1 获取使用记录列表

**接口路径**: `GET /api/wechat/admin/usage-records`

**调用页面**: pages/admin/usage-records/index

---

### 11.2 获取使用统计

**接口路径**: `GET /api/wechat/admin/usage-records/stats`

**调用页面**: pages/admin/usage-records/index

---

## 12. 天气通知模块

### 12.1 获取天气通知设置

**接口路径**: `GET /api/wechat/weather-notification-settings`

**调用页面**: pages/admin/weather-notification-settings/index

---

### 12.2 保存天气通知设置

**接口路径**: `POST /api/wechat/weather-notification-settings`

**调用页面**: pages/admin/weather-notification-settings/index

---

## 13. 天气严重程度模块

### 13.1 获取严重程度配置

**接口路径**: `GET /api/wechat/weather-severity-config`

**调用页面**: pages/admin/weather-severity-settings/index

---

### 13.2 保存自定义配置

**接口路径**: `POST /api/wechat/weather-severity-config`

**调用页面**: pages/admin/weather-severity-settings/index

---

## 14. 电费通知模块

### 14.1 获取电费通知设置

**接口路径**: `GET /api/wechat/df-notification-settings`

**调用页面**: pages/admin/df-notification-settings/index

---

### 14.2 保存电费通知设置

**接口路径**: `POST /api/wechat/df-notification-settings`

**调用页面**: pages/admin/df-notification-settings/index

---

## 15. 位置搜索模块

### 15.1 搜索城市

**接口路径**: `GET /api/wechat/search-city`

**调用页面**: pages/admin/weather-notification-settings/index

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| query | string | 是 | 搜索关键词 |
| number | number | 否 | 返回数量 |

---

## 附录

### API统计

- 总接口数: 70个
- 模块数: 15个
- 页面数: 28个

### 错误处理

所有接口遵循统一的错误响应格式。

---

**文档版本**: v1.0  
**最后更新**: 2026-03-31 22:11
