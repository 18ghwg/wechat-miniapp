# 电费查询测试模式自动检测修复说明

## 问题描述
电费查询界面在测试模式下的表现异常：
- 小程序**刚打开时**，电费查询界面获取到的是**真实数据**
- 跳转到其他界面**再返回**电费查询界面后，才变成**mock数据**
- 期望：第一次打开时就应该使用mock数据

## 问题原因
1. 电费查询页面每次都直接调用 `testModeManager.isTestMode()` 进行实时查询
2. 在小程序刚启动时，`testModeManager` 的内存缓存为空（`globalTestModeCache = null`）
3. 虽然 `isGlobalTestMode()` 会尝试从本地存储读取，但首次调用时可能还没有存储数据
4. 导致首次返回默认值 `false`，使用真实数据
5. 后续调用时，状态已经从服务器异步获取到了，就返回正确的 `true`，使用mock数据

## 问题分析时序图

```
小程序启动
    ↓
首页加载（电费查询tab）
    ↓
loadElectricData() 被调用
    ↓
调用 testModeManager.isTestMode()
    ↓
调用 isGlobalTestMode()
    ↓
globalTestModeCache = null （首次）
    ↓
尝试从本地存储读取 globalTestModeState（可能为空）
    ↓
返回 false（默认值）
    ↓
使用真实数据接口 ❌
    ↓
异步从服务器获取状态（完成）
    ↓
用户切换到其他tab再返回
    ↓
loadElectricData() 再次被调用
    ↓
调用 testModeManager.isTestMode()
    ↓
globalTestModeCache 已有值（true）
    ↓
返回 true
    ↓
使用mock数据 ✅
```

## 修复内容

### 1. 添加测试模式状态缓存
在 `Page` 对象中添加 `_isTestMode` 变量缓存测试模式状态：

```javascript
// ========== 性能优化：权限判断缓存 ==========
_adminCache: null,           // 权限判断缓存
_adminCacheUserId: null,     // 缓存对应的用户ID
_isTestMode: false,          // 测试模式状态缓存 ✅ 新增
```

### 2. 优化 onLoad 方法
在页面加载时立即缓存测试模式状态：

```javascript
onLoad() {
  // ===== 关键修复：在onLoad时立即缓存测试模式状态 =====
  this._isTestMode = testModeManager.isTestMode();
  console.log(`🔧 电费查询页面加载，测试模式状态: ${this._isTestMode}`);
  
  // ... 其他初始化代码
  
  // 设置测试模式热加载
  testModeManager.setupPageHotReload(this, function() {
    console.log('电费查询页面-测试模式热加载');
    // 更新测试模式状态
    this._isTestMode = testModeManager.isTestMode();
    // ... 重新加载数据
  });
}
```

### 3. 优化 onShow 方法
每次页面显示时检测测试模式状态变化：

```javascript
onShow() {
  this.getTabBar().init();
  
  // ===== 关键修复：每次显示页面时都重新检测测试模式 =====
  const oldTestMode = this._isTestMode;
  const newTestMode = testModeManager.isTestMode();
  const testModeChanged = oldTestMode !== newTestMode;
  
  if (testModeChanged) {
    console.log(`🔄 电费查询-测试模式状态变化: ${oldTestMode} -> ${newTestMode}`);
    this._isTestMode = newTestMode;
    
    // 清除缓存并强制刷新所有数据
    this.clearAdminCache();
    this.checkUserBinding();
    this.loadAccountStats();
    this.loadAllAccountsCount();
    this.loadUserGridAccounts();
    return;
  }
  
  // ... 正常逻辑
}
```

### 4. 修改所有测试模式判断
将所有 `testModeManager.isTestMode()` 改为使用缓存的 `this._isTestMode`：

**修改前：**
```javascript
if (testModeManager.isTestMode()) {
  // 使用mock数据
}
```

**修改后：**
```javascript
if (this._isTestMode) {
  // 使用mock数据
}
```

**修改位置：**
- ✅ `loadAccountStats()` - 账号统计
- ✅ `loadAllAccountsCount()` - 所有账号数量
- ✅ `loadUserGridAccounts()` - 用户绑定账号
- ✅ `checkUserBinding()` - 绑定状态检查
- ✅ `loadElectricData()` - 电费数据查询
- ✅ `loadChartData()` - 图表数据
- ✅ `loadHistoryData()` - 历史记录

## 修复后的工作流程

```
小程序启动
    ↓
onLoad: 立即缓存测试模式状态 → this._isTestMode
    ↓
testModeManager.isTestMode() 被调用
    ↓
从本地存储恢复状态（如果有）
    ↓
立即返回缓存值或默认值
    ↓
异步从服务器获取最新状态（不阻塞）
    ↓
loadElectricData() 被调用
    ↓
使用 this._isTestMode（已缓存）
    ↓
✅ 正确使用mock数据
    ↓
onShow: 检测状态变化
    ↓
如果状态变化 → 更新缓存 → 重新加载数据
```

## 验证步骤

### 场景1：首次打开小程序（测试模式已开启）
1. 确保后台测试模式已开启
2. **完全关闭小程序**（从最近使用中划掉）
3. 重新打开小程序
4. **直接查看电费查询tab**（首页默认tab）
5. **预期结果**：应该立即显示mock数据
   - 显示5个测试账户
   - 账号为 13800138001-13800138005
   - 余额和用电量都有数据

### 场景2：Tab切换测试
1. 在测试模式开启的情况下，查看电费查询（应显示mock数据）
2. 切换到考勤管理tab
3. 再切换回电费查询tab
4. **预期结果**：仍然显示mock数据（不会切换成真实数据）

### 场景3：测试模式开关切换
1. 在测试模式开启状态下使用电费查询
2. 关闭测试模式（通过管理后台）
3. 返回电费查询tab
4. **预期结果**：自动切换到真实数据
5. 重新开启测试模式
6. 返回电费查询tab
7. **预期结果**：自动切换到mock数据

### 场景4：下拉刷新
1. 在测试模式下进入电费查询
2. 下拉刷新页面
3. **预期结果**：仍然显示mock数据（不会因为刷新而变成真实数据）

## Mock数据特征

### 电费查询Mock数据：
- **账号数量**：5个测试账户
- **手机号**：13800138001 - 13800138005
- **账户名称**：测试账户1 - 测试账户5
- **余额范围**：89.23 - 334.12元
- **用电量**：8.9 - 18.7度
- **查询时间**：模拟最近几天的数据
- **激活状态**：第1个账户激活，其他未激活

### 统计数据：
- **账号统计**：15个账号，28个户号
- **所有账号数量**：25个

## 调试日志

开启小程序调试模式后，关键日志：

```
// 页面加载
🔧 电费查询页面加载，测试模式状态: true

// 数据加载
电费绑定检查-测试模式：假设已绑定
电费查询-测试模式：使用mock数据
测试模式：使用mock账号统计数据
测试模式：使用mock所有账号数量
测试模式：使用mock用户绑定账号

// 状态变化
🔄 电费查询-测试模式状态变化: false -> true
```

## 与考勤管理的对比

| 功能 | 考勤管理 | 电费查询 |
|------|---------|---------|
| **问题表现** | 重启后变真实数据 | 首次打开是真实数据 |
| **问题原因** | onShow时未检测状态 | 每次实时查询，首次未缓存 |
| **修复方案** | onShow时检测变化 | onLoad时立即缓存 + onShow检测 |
| **测试模式缓存** | ✅ | ✅ |
| **状态变化检测** | ✅ | ✅ |

## 注意事项

1. **测试模式状态来源**：
   - 全局测试模式开关（最高优先级，从服务器获取）
   - 微信开发工具一键登录测试模式（本地Storage）
   
2. **缓存策略**：
   - 页面级缓存：`this._isTestMode`
   - 全局缓存：`testModeManager.globalTestModeCache`（30秒过期）
   - 本地持久化：`wx.getStorageSync('globalTestModeState')`

3. **性能优化**：
   - 避免每次数据加载都调用 `testModeManager.isTestMode()`
   - 使用页面级缓存减少函数调用开销
   - 只在状态变化时重新加载数据

## 相关文件

- `微信Flask-小程序/pages/electric/index.js` - 电费查询页面
- `微信Flask-小程序/utils/testMode.js` - 测试模式管理器
- `微信Flask-小程序/pages/attendance/index.js` - 考勤管理页面（类似修复）

## 修复日期
2025年10月14日













