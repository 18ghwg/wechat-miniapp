# 📊 功能使用记录埋点说明

## 概述

功能使用记录系统用于追踪用户在小程序中使用各个功能的频率，从而在用户中心的"快速功能"区域展示用户最常用的功能。

## 如何添加埋点

### 基本步骤

在需要追踪的功能页面的 `onLoad()` 方法中添加埋点代码：

```javascript
// 1. 在文件顶部引入 featureUsage 工具
const featureUsage = require('../../utils/feature-usage');

Page({
  onLoad() {
    // 2. 记录功能使用
    featureUsage.recordFeatureUsage('功能key', '功能名称', '功能图标emoji');
    
    // ... 其他初始化代码
  }
})
```

### 参数说明

- **功能key**（必填）：功能的唯一标识，用于路由跳转和数据库记录
- **功能名称**（必填）：显示给用户看的功能名称
- **功能图标emoji**（可选）：功能图标，推荐使用emoji

### 功能key命名规范

功能key需要与用户中心页面的路由映射保持一致：

```javascript
// 微信Flask-小程序/pages/usercenter/index.js
const featureRoutes = {
  'electric': '/pages/electric/index',             // TabBar页面
  'attendance': '/pages/attendance/index',         // TabBar页面
  'home': '/pages/home/home',                      // TabBar页面
  'weather': '/pages/weather/index',               // 普通页面
  'notification-group': '/pages/admin/notification-group/index',
  'df-notification': '/pages/admin/df-notification-settings/index',
  'weather-settings': '/pages/admin/weather-settings/index',
  'user-management': '/pages/admin/miniprogram-users/index',
  'announcement': '/pages/announcement/manage',
  'task-management': '/pages/admin/task-management/list/index'
};
```

**⚠️ 重要提示：TabBar 页面跳转**

系统会自动区分 TabBar 页面和普通页面：
- **TabBar 页面**（首页、电费查询、考勤管理、我的）使用 `wx.switchTab` 跳转
- **普通页面**（管理功能等）使用 `wx.navigateTo` 跳转

TabBar 页面列表定义：
```javascript
const tabBarPages = [
  '/pages/home/home',
  '/pages/electric/index',
  '/pages/attendance/index',
  '/pages/usercenter/index'
];
```

## 已添加埋点的页面

### ✅ 用户功能

1. **电费查询** - `pages/electric/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('electric', '电费查询', '⚡');
   ```

2. **考勤管理** - `pages/attendance/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('attendance', '考勤管理', '📋');
   ```

### ✅ 管理功能（仅管理员可见）

3. **电费通知设置** - `pages/admin/df-notification-settings/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('df-notification', '电费通知设置', '⚡');
   ```

4. **天气设置** - `pages/admin/weather-settings/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('weather-settings', '天气设置', '🌤️');
   ```

5. **任务管理** - `pages/admin/task-management/list/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('task-management', '任务管理', '⏰');
   ```

6. **小程序账号管理** - `pages/admin/miniprogram-users/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('user-management', '小程序账号管理', '👥');
   ```

7. **通知群管理** - `pages/admin/notification-group/index.js`
   ```javascript
   featureUsage.recordFeatureUsage('notification-group', '通知群管理', '🔔');
   ```

8. **公告管理** - `pages/announcement/manage.js`
   ```javascript
   featureUsage.recordFeatureUsage('announcement', '公告管理', '📢');
   ```

## 待添加埋点的页面

以下页面可以根据需要添加埋点：

- ⏳ 天气查询页面（如果存在）
- ⏳ 报销管理页面（如果存在）
- ⏳ 其他业务功能页面

## 数据流程

### 1. 用户访问功能页面
```
用户打开页面
  ↓
onLoad() 方法执行
  ↓
featureUsage.recordFeatureUsage() 被调用
```

### 2. 记录到数据库
```
前端调用 POST /feature-usage/record
  ↓
后端 UserFeatureUsageClass.record_usage()
  ↓
更新 UserFeatureUsage 表
  - 首次使用：创建新记录
  - 再次使用：usage_count + 1，更新 last_used_time
```

### 3. 展示在用户中心
```
用户打开用户中心
  ↓
loadFrequentFeatures() 方法执行
  ↓
调用 GET /feature-usage/frequent
  ↓
获取使用次数最多的前6个功能
  ↓
显示在"快速功能"区域
```

## 用户体验

### 显示规则

#### 智能筛选阈值
- **使用次数阈值**：至少使用 **3次** 才会显示在快速功能区域
- **时间范围**：只统计 **最近30天** 内的活跃功能
- **最大显示数量**：最多显示 **6个** 常用功能

#### 初次使用
- 用户使用次数未达到阈值时，"快速功能"区域显示默认功能：
  - 电费查询
  - 考勤管理
  - 使用记录

#### 达到阈值后
- 用户使用过某些功能超过3次后，"快速功能"区域自动更新为最常用的功能
- 每个功能卡片右上角显示总使用次数徽章
  - 使用次数 ≤ 999：显示实际数字（如：3、50、500）
  - 使用次数 > 999：显示 "999+"（避免数字过长溢出）
- 标题右侧显示统计说明："最近30天内使用超过3次的功能"

#### 实时更新
- 每次用户进入用户中心页面时，系统会自动刷新常用功能列表
- 使用频率实时计算，无需手动刷新
- 超过30天未使用的功能会自动从列表中移除

## 技术细节

### 静默记录
```javascript
// 记录失败不影响页面正常使用
featureUsage.recordFeatureUsage('electric', '电费查询', '⚡')
  .catch(err => {
    // 静默失败，不弹出错误提示
    console.error('记录失败:', err);
  });
```

### 自动认证
- 使用 `wx.getStorageSync('openid')` 自动获取用户身份
- 未登录用户会跳过记录，不影响页面使用

### 测试模式支持
- 使用 `testModeManager.isGlobalTestMode()` 检测测试模式
- 测试模式下的使用记录会单独标记

## 数据库表结构

```sql
CREATE TABLE `UserFeatureUsage` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `feature_key` varchar(50) NOT NULL COMMENT '功能标识',
  `feature_name` varchar(100) NOT NULL COMMENT '功能名称',
  `feature_icon` varchar(10) COMMENT '功能图标emoji',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '使用次数',
  `last_used_time` datetime NOT NULL COMMENT '最后使用时间',
  `first_used_time` datetime NOT NULL COMMENT '首次使用时间',
  UNIQUE KEY `uk_user_feature` (`user_id`, `feature_key`),
  INDEX `idx_user_usage` (`user_id`, `usage_count`),
  INDEX `idx_last_used` (`user_id`, `last_used_time`)
);
```

## API接口

### 记录功能使用
```http
POST /api/wechat/feature-usage/record
Content-Type: application/json

{
  "feature_key": "electric",
  "feature_name": "电费查询",
  "feature_icon": "⚡",
  "test_mode": 0
}
```

### 获取常用功能
```http
GET /api/wechat/feature-usage/frequent?limit=6&min_usage_count=3&days=30&test_mode=0
```

**查询参数说明：**
- `limit`: 返回数量限制（默认6）
- `min_usage_count`: 最小使用次数阈值（默认3）
- `days`: 活跃天数范围（默认30天）
- `test_mode`: 测试模式标识

### 获取可用功能
```http
GET /api/wechat/feature-usage/available?test_mode=0
```

### 获取使用统计
```http
GET /api/wechat/feature-usage/statistics?test_mode=0
```

## 注意事项

1. **路由一致性**：确保 `feature_key` 与 `featureRoutes` 中的key一致
2. **图标选择**：推荐使用单个emoji字符作为图标
3. **性能影响**：记录操作是异步的，不会阻塞页面加载
4. **错误处理**：记录失败会静默处理，不影响用户体验
5. **权限控制**：管理功能的记录会自动根据用户权限过滤

## 配置说明

### 可调整的参数

在 `微信Flask-小程序/pages/usercenter/index.js` 的 `loadFrequentFeatures()` 方法中：

```javascript
const limit = 6;              // 最多显示6个功能
const minUsageCount = 3;      // 至少使用3次才显示
const days = 30;              // 统计最近30天
```

可以根据需要调整这些参数来改变显示策略。

### 推荐配置

| 场景 | limit | minUsageCount | days | 说明 |
|-----|-------|---------------|------|------|
| 新用户友好 | 6 | 2 | 60 | 降低阈值，延长统计时间 |
| **默认配置** | **6** | **3** | **30** | **平衡的配置** |
| 重度用户 | 8 | 5 | 14 | 提高阈值，缩短时间 |

## 未来扩展

可以考虑添加以下功能：

- 📈 使用趋势分析（按周/月统计）
- 🎯 个性化推荐（基于使用习惯）
- 📊 管理员后台统计面板
- 🔥 热门功能排行榜（全站统计）
- ⏰ 使用时间分析（高峰时段）
- 🎨 自定义阈值设置（用户可调整）

