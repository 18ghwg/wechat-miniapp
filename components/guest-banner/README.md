# 游客模式提示横幅组件 (guest-banner)

## 📝 组件说明

全局的游客模式/体验模式提示横幅组件，统一的视觉风格，复用电费查询界面的设计。

## 🎨 视觉特点

- 👁️ 醒目的眼睛图标
- 🌈 紫色渐变背景 (`#667eea` → `#764ba2`)
- 📌 粘性定位，滚动时保持可见
- 🎯 简洁明了的提示信息
- 🔘 可选的登录按钮或关闭按钮

## 💻 使用方法

### 1. 在页面 JSON 中引入组件

```json
{
  "usingComponents": {
    "guest-banner": "/components/guest-banner/index"
  }
}
```

### 2. 在页面 WXML 中使用

```xml
<guest-banner 
  show="{{isGuest}}"
  message="当前显示演示数据"
  showLoginBtn="{{true}}"
  showCloseBtn="{{false}}"
  bind:close="closeGuestBanner"
  bind:login="goToLogin"
/>
```

## 📋 属性列表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| show | Boolean | false | 是否显示横幅 |
| message | String | '当前显示演示数据' | 提示消息文本 |
| showLoginBtn | Boolean | true | 是否显示"登录查看真实数据"按钮 |
| showCloseBtn | Boolean | false | 是否显示关闭按钮 |

## 🎯 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| login | 点击登录按钮时触发 | - |
| close | 点击关闭按钮时触发 | - |

## 📦 已应用页面

- ✅ 电费查询 (`pages/electric/index`)
- ✅ 考勤管理 (`pages/attendance/index`)
- ✅ 考勤历史 (`pages/attendance/history/index`)
- ✅ 补打卡 (`pages/attendance/submit/index`)

## 🔧 页面集成示例

### 示例 1：带登录按钮（电费查询风格）

```xml
<guest-banner 
  show="{{isGuest}}"
  message="当前显示演示数据"
  showLoginBtn="{{true}}"
/>
```

### 示例 2：带关闭按钮（考勤补打卡风格）

```xml
<guest-banner 
  show="{{isGuest}}"
  message="提交的数据不会保存到服务器"
  showLoginBtn="{{true}}"
  showCloseBtn="{{true}}"
  bind:close="closeGuestBanner"
/>
```

### 示例 3：自定义消息

```xml
<guest-banner 
  show="{{isGuest}}"
  message="所有数据仅供展示"
  showLoginBtn="{{true}}"
/>
```

## 🎨 样式说明

组件样式完全封装在组件内部，页面无需额外引入样式。

- 使用 `position: sticky` 保持顶部可见
- 响应式布局，自适应各种屏幕尺寸
- 优雅的渐变背景和阴影效果
- 统一的品牌色系

## 📝 注意事项

1. **数据绑定**：确保页面有 `isGuest` 数据字段
2. **事件处理**：根据需要绑定 `close` 或 `login` 事件
3. **消息定制**：根据页面功能定制 `message` 内容
4. **按钮选择**：根据交互需求选择显示登录或关闭按钮

## 🚀 优势

- ✅ **统一风格**：所有页面使用相同的视觉设计
- ✅ **易于维护**：样式集中管理，修改一处全局生效
- ✅ **灵活配置**：通过属性灵活控制显示内容和交互
- ✅ **代码复用**：减少重复代码，提高开发效率

