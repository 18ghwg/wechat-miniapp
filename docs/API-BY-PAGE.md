# 小程序页面API调用索引

> 按页面分类的API接口调用关系文档
> 
> 最后更新：2026-03-31

## 目录

- [主包页面](#主包页面)
- [管理员子包页面](#管理员子包页面)

---

## 主包页面

### pages/login/index - 登录页

**使用的API (2个)**:
- `POST /api/wechat/auth/login` - 微信登录
- `POST /api/wechat/auth/account-login` - 账号密码登录

---

### pages/attendance/index - 考勤打卡主页

**使用的API (5个)**:
- `GET /api/wechat/user/info` - 获取用户信息
- `POST /api/wechat/user/update_real_name` - 更新真实姓名
- `GET /api/wechat/attendance/today` - 获取今日考勤
- `POST /api/wechat/attendance/submit` - 提交考勤
- `GET /api/wechat/attendance/history` - 获取考勤历史

---

### pages/attendance/history/index - 考勤历史

**使用的API (4个)**:
- `GET /api/wechat/attendance/history` - 获取考勤历史
- `GET /api/wechat/attendance/{id}` - 获取考勤详情
- `PUT /api/wechat/attendance/{id}` - 更新考勤
- `DELETE /api/wechat/attendance/{id}` - 删除考勤

---

### pages/attendance/missing-checkin/index - 补打卡

**使用的API (2个)**:
- `POST /api/wechat/attendance/submit` - 提交考勤
- `POST /api/wechat/attendance/upload-to-netdisk` - 上传到网盘

---

### pages/attendance/netdisk/index - 网盘设置

**使用的API (3个)**:
- `GET /api/wechat/attendance/netdisk-info` - 获取网盘信息
- `POST /api/wechat/attendance/netdisk-info` - 更新网盘信息
- `DELETE /api/wechat/attendance/netdisk-info` - 删除网盘信息

---

### pages/electric/index - 电费查询主页

**使用的API (5个)**:
- `GET /api/wechat/user/info` - 获取用户信息
- `POST /api/wechat/electric/query` - 查询电费
- `GET /api/wechat/electric/history` - 获取电费历史
- `GET /api/wechat/grid/accounts` - 获取国网账号列表
- `GET /api/wechat/physical-meters` - 获取实体电表数据

---

### pages/electric/history/index - 电费历史

**使用的API (4个)**:
- `GET /api/wechat/electric/history` - 获取电费历史
- `GET /api/wechat/electric/admin-account-options` - 获取管理员账号选项
- `GET /api/wechat/electric/user-account-options` - 获取用户户号选项
- `GET /api/wechat/electric/admin-room-options` - 获取管理员房间选项

---

### pages/electric/account-manage/index - 电费账户管理

**使用的API (6个)**:
- `GET /api/wechat/grid/accounts` - 获取国网账号列表
- `POST /api/wechat/grid/accounts/bind` - 绑定国网账号
- `DELETE /api/wechat/grid/accounts/{account_id}` - 解绑国网账号
- `PUT /api/wechat/grid/accounts/{account_id}` - 编辑国网账号
- `POST /api/wechat/grid/accounts/{account_id}/set-active` - 设置活跃账号
- `POST /api/wechat/grid/check-meter-ip` - 检测电表IP

---

### pages/usercenter/index - 用户中心

**使用的API (4个)**:
- `GET /api/wechat/user/info` - 获取用户信息
- `POST /api/wechat/user/update_real_name` - 更新真实姓名
- `GET /api/wechat/user/debug-permissions` - 调试用户权限
- `GET /api/wechat/announcement/list` - 获取公告列表

---

### pages/user/bind/index - 用户绑定

**使用的API (3个)**:
- `POST /api/wechat/auth/bind` - 绑定Web账号
- `POST /api/wechat/auth/unbind` - 解绑Web账号
- `GET /api/wechat/grid/accounts` - 获取国网账号列表

---

### pages/user/settings/index - 用户设置

**使用的API (1个)**:
- `POST /api/wechat/user/delete-account` - 注销账号

---

### pages/announcement/manage - 公告管理

**使用的API (4个)**:
- `GET /api/wechat/announcement/manage` - 管理员获取所有公告
- `POST /api/wechat/announcement/create` - 创建公告
- `PUT /api/wechat/announcement/update/{id}` - 更新公告
- `DELETE /api/wechat/announcement/delete/{id}` - 删除公告

---

### pages/feedback/index - 意见反馈

**使用的API (2个)**:
- `GET /api/wechat/feedback/setting` - 获取反馈设置
- `POST /api/wechat/feedback/submit` - 提交反馈

---

### pages/home/home - 首页

**使用的API (1个)**:
- `GET /api/wechat/user/info` - 获取用户信息

---

### pages/terms/index - 服务条款

**使用的API**: 无（静态页面）

---

### pages/privacy/index - 隐私政策

**使用的API**: 无（静态页面）

---

## 管理员子包页面

### pages/admin/miniprogram-users/index - 小程序用户管理

**使用的API (6个)**:
- `GET /api/wechat/admin/miniprogram-users` - 获取用户列表
- `POST /api/wechat/admin/miniprogram-users` - 创建用户
- `PUT /api/wechat/admin/miniprogram-users/{user_id}` - 更新用户
- `DELETE /api/wechat/admin/miniprogram-users/{user_id}` - 删除用户
- `GET /api/wechat/admin/miniprogram-users/{user_id}/permissions` - 获取用户权限
- `GET /api/wechat/admin/miniprogram-users/{user_id}/operation-logs` - 获取用户操作日志

---

### pages/admin/task-management/list/index - 任务管理列表

**使用的API (6个)**:
- `GET /api/wechat/admin/tasks` - 获取任务列表
- `POST /api/wechat/admin/tasks/{task_id}/pause` - 暂停任务
- `POST /api/wechat/admin/tasks/{task_id}/resume` - 恢复任务
- `POST /api/wechat/admin/tasks/{task_id}/run` - 立即执行任务
- `GET /api/wechat/admin/tasks/{task_id}/status` - 获取任务执行状态
- `DELETE /api/wechat/admin/tasks/{task_id}` - 删除任务

---

### pages/admin/task-management/edit/index - 任务编辑

**使用的API (2个)**:
- `GET /api/wechat/admin/tasks/{task_id}` - 获取任务详情
- `PUT /api/wechat/admin/tasks/{task_id}` - 更新任务配置

---

### pages/admin/task-management/logs/index - 任务日志

**使用的API (2个)**:
- `GET /api/wechat/admin/tasks/{task_id}/logs` - 获取任务日志
- `GET /api/wechat/admin/logs/dates` - 获取可用日志日期列表

---

### pages/admin/usage-records/index - 使用记录管理

**使用的API (7个)**:
- `GET /api/wechat/admin/usage-records` - 获取使用记录列表
- `GET /api/wechat/admin/usage-records/stats` - 获取使用统计
- `GET /api/wechat/feature-usage/total-count` - 获取使用记录总数
- `POST /api/wechat/feature-usage/cleanup` - 清理旧的使用记录
- `POST /api/wechat/admin/usage-records` - 创建使用记录
- `PUT /api/wechat/admin/usage-records/{id}` - 更新使用记录
- `DELETE /api/wechat/admin/usage-records/{id}` - 删除使用记录

---

### pages/admin/weather-notification-settings/index - 天气通知设置

**使用的API (3个)**:
- `GET /api/wechat/weather-notification-settings` - 获取天气通知设置
- `POST /api/wechat/weather-notification-settings` - 保存天气通知设置
- `GET /api/wechat/search-city` - 搜索城市

---

### pages/admin/weather-severity-settings/index - 天气严重程度设置

**使用的API (3个)**:
- `GET /api/wechat/weather-severity-config` - 获取严重程度配置
- `POST /api/wechat/weather-severity-config/apply-preset` - 应用预设配置
- `POST /api/wechat/weather-severity-config` - 保存自定义配置

---

### pages/admin/df-notification-settings/index - 电费通知设置

**使用的API (2个)**:
- `GET /api/wechat/df-notification-settings` - 获取电费通知设置
- `POST /api/wechat/df-notification-settings` - 保存电费通知设置

---

### pages/admin/notification-group/index - 通知组管理

**使用的API**: 待补充

---

### pages/admin/weather-settings/index - 天气设置

**使用的API**: 待补充

---

## 统计信息

### 按页面类型统计

- **主包页面**: 15个
- **管理员子包页面**: 9个
- **总计**: 24个

### 按API使用频率统计

**高频API (被3个以上页面调用)**:
- `GET /api/wechat/user/info` - 4个页面
- `GET /api/wechat/attendance/history` - 2个页面
- `GET /api/wechat/electric/history` - 2个页面
- `GET /api/wechat/grid/accounts` - 3个页面
- `POST /api/wechat/attendance/submit` - 2个页面

### 按功能模块统计

- **考勤管理**: 11个API，5个页面
- **电费查询**: 15个API，3个页面
- **用户管理**: 8个API，4个页面
- **管理员功能**: 28个API，9个页面

---

**文档版本**: v1.0  
**最后更新**: 2026-03-31 22:11  
**维护者**: 开发团队
