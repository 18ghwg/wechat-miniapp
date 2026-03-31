# Canvas 2D 迁移指南

## 用户中心页面 Canvas 迁移方案

### 主要改动对比

#### 旧版 Canvas API：
```javascript
const canvas = wx.createCanvasContext('avatarCanvas', this);
canvas.setFillStyle('#ff0000');
canvas.fillRect(0, 0, 120, 120);
canvas.draw(true, () => {
  wx.canvasToTempFilePath({
    canvasId: 'avatarCanvas',
    // ...
  }, this);
});
```

#### 新版 Canvas 2D API：
```javascript
wx.createSelectorQuery()
  .in(this)
  .select('#avatarCanvas')
  .fields({ node: true, size: true })
  .exec((res) => {
    const canvas = res[0].node;
    const ctx = canvas.getContext('2d');
    
    // 设置像素比
    const dpr = wx.getWindowInfo().pixelRatio || 1;
    canvas.width = 120 * dpr;
    canvas.height = 120 * dpr;
    ctx.scale(dpr, dpr);
    
    // 绘制
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 120, 120);
    
    // 不需要 draw()，直接转图片
    wx.canvasToTempFilePath({
      canvas: canvas,  // 使用 canvas 对象
      // ...
    });
  });
```

### API 对照表

| 旧版 API | Canvas 2D API |
|---------|---------------|
| `wx.createCanvasContext(id)` | `wx.createSelectorQuery().select('#id').fields({ node: true })` |
| `canvas.setFillStyle(color)` | `ctx.fillStyle = color` |
| `canvas.setStrokeStyle(color)` | `ctx.strokeStyle = color` |
| `canvas.setLineWidth(width)` | `ctx.lineWidth = width` |
| `canvas.setFontSize(size)` | `ctx.font = size + 'px sans-serif'` |
| `canvas.setTextAlign(align)` | `ctx.textAlign = align` |
| `canvas.setTextBaseline(baseline)` | `ctx.textBaseline = baseline` |
| `canvas.fillText(text, x, y)` | `ctx.fillText(text, x, y)` |
| `canvas.fillRect(x, y, w, h)` | `ctx.fillRect(x, y, w, h)` |
| `canvas.draw(reserve, callback)` | **不需要** - 直接绘制 |
| `wx.canvasToTempFilePath({ canvasId })` | `wx.canvasToTempFilePath({ canvas })` |

### 完整参考代码

已保存在 `canvas-2d-avatar.txt` 文件中，可以直接复制替换 `index.js` 第 219-327 行的代码。

### 性能优势

1. ✅ **同层渲染** - 更好的性能
2. ✅ **更接近标准** - 与 Web Canvas API 一致
3. ✅ **无需 draw()** - 实时绘制
4. ✅ **更好的兼容性** - 支持更多高级特性
