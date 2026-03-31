// components/slider-captcha/index.js
const api = require('../../utils/api');

Component({
  properties: {
    title: { type: String, value: '请拖动滑块完成拼图' }
  },

  data: {
    canvasWidth: 300,
    canvasHeight: 225,
    puzzleSize: 60,
    realPuzzleX: null,
    puzzleX: 0,
    puzzleY: 82.5,
    sliderX: 0,
    sliderMaxX: 240,
    dragging: false,
    loading: false,
    verifySuccess: false,
    verifyFail: false,
    captchaToken: '',
    sliderText: '向右滑动完成拼图',
    bgStyle: '',
    puzzleStyle: '',
    _shouldGenerateCaptcha: false
  },

  methods: {
    preventScroll() { return true; },

    initCanvas() {
      const that = this;
      const windowInfo = wx.getWindowInfo();
      const dpr = windowInfo.pixelRatio || 1;
      const query = this.createSelectorQuery().in(this);
      query.select('.canvas-wrapper').boundingClientRect().exec((res) => {
        if (res && res[0]) {
          const containerWidth = res[0].width;
          const actualWidth = Math.min(containerWidth, 300);
          const actualHeight = actualWidth * 3 / 4;
          that.setData({
            canvasWidth: actualWidth,
            canvasHeight: actualHeight,
            sliderMaxX: actualWidth - that.data.puzzleSize,
            puzzleY: (actualHeight - that.data.puzzleSize) / 2
          });
          that.initCanvasNodes(dpr, () => {
            if (that.data._shouldGenerateCaptcha) {
              that.setData({ _shouldGenerateCaptcha: false }, () => {
                that.generateCaptcha();
              });
            }
          });
        }
      });
    },

    initCanvasNodes(dpr, callback) {
      const that = this;
      let bgReady = false;
      let puzzleReady = false;
      let called = false;
      const check = () => {
        if (bgReady && puzzleReady && !called) {
          called = true;
          callback && callback();
        }
      };
      const bgQuery = this.createSelectorQuery().in(this);
      bgQuery.select('#captcha-canvas').fields({ node: true, size: true }).exec((res) => {
        if (res && res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          canvas.width = that.data.canvasWidth * dpr;
          canvas.height = that.data.canvasHeight * dpr;
          ctx.scale(dpr, dpr);
          that.setData({ bgCanvas: canvas, bgCtx: ctx }, () => { bgReady = true; check(); });
        }
      });
      const puzzleQuery = this.createSelectorQuery().in(this);
      puzzleQuery.select('#puzzle-canvas').fields({ node: true, size: true }).exec((res) => {
        if (res && res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          canvas.width = that.data.puzzleSize * dpr;
          canvas.height = that.data.puzzleSize * dpr;
          ctx.scale(dpr, dpr);
          that.setData({ puzzleCanvas: canvas, puzzleCtx: ctx }, () => { puzzleReady = true; check(); });
        }
      });
    },

    updateStyles() {
      this.setData({
        bgStyle: `width: ${this.data.canvasWidth}px; height: ${this.data.canvasHeight}px;`,
        puzzleStyle: `width: ${this.data.puzzleSize}px; height: ${this.data.puzzleSize}px; left: ${this.data.puzzleX}px; top: ${this.data.puzzleY}px;`
      });
    },

    // 绘制圆角 clip 路径（复用）
    _clipRoundRect(ctx, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.arcTo(w, 0, w, r, r);
      ctx.lineTo(w, h - r);
      ctx.arcTo(w, h, w - r, h, r);
      ctx.lineTo(r, h);
      ctx.arcTo(0, h, 0, h - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
    },

    drawBackground() {
      const ctx = this.data.bgCtx;
      if (!ctx) return;
      const { canvasWidth, canvasHeight, puzzleSize, realPuzzleX, puzzleY } = this.data;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.save();
      this._clipRoundRect(ctx, canvasWidth, canvasHeight, 16);
      ctx.clip();

      // 米色背景
      ctx.fillStyle = '#FFF5E6';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 圆点网格
      ctx.fillStyle = 'rgba(255, 159, 67, 0.18)';
      const dotR = 4, gap = 16;
      for (let y = gap; y < canvasHeight; y += gap) {
        for (let x = gap; x < canvasWidth; x += gap) {
          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 缺口虚线圆
      if (realPuzzleX !== null && realPuzzleX !== undefined) {
        const cx = realPuzzleX + puzzleSize / 2;
        const cy = puzzleY + puzzleSize / 2;
        const slotR = puzzleSize / 2 - 4;
        ctx.strokeStyle = '#C4956A';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, slotR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    },

    // 失败时在画布上叠加效果 - 感叹号填充到缺口位置
    drawFailOverlay() {
      const ctx = this.data.bgCtx;
      if (!ctx) return;
      const { canvasWidth, canvasHeight, puzzleSize, realPuzzleX, puzzleY } = this.data;

      // 先重绘正常背景
      this.drawBackground();

      ctx.save();
      this._clipRoundRect(ctx, canvasWidth, canvasHeight, 16);
      ctx.clip();

      // 红色半透明遮罩
      ctx.fillStyle = 'rgba(239, 68, 68, 0.10)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 感叹号图标画在缺口中心，半径撑满缺口（puzzleSize/2 - 2）
      if (realPuzzleX !== null && realPuzzleX !== undefined) {
        const cx = realPuzzleX + puzzleSize / 2;
        const cy = puzzleY + puzzleSize / 2;
        const r = puzzleSize / 2 - 2; // 和缺口虚线圆一样大

        // 白色填充圆（完全覆盖缺口区域）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // 深色边框
        ctx.strokeStyle = '#5E4E3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 红色外圆（AlertCircle 风格）
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.stroke();

        // 感叹号竖线（按比例缩放）
        const barH = r * 0.45;
        const barW = r * 0.13;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - barW / 2, cy - r * 0.38, barW, barH);

        // 感叹号圆点
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.28, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },

    // 成功时在画布上叠加效果 - 勾号填充到缺口位置
    drawSuccessOverlay() {
      const ctx = this.data.bgCtx;
      if (!ctx) return;
      const { canvasWidth, canvasHeight, puzzleSize, realPuzzleX, puzzleY } = this.data;

      this.drawBackground();

      ctx.save();
      this._clipRoundRect(ctx, canvasWidth, canvasHeight, 16);
      ctx.clip();

      // 绿色半透明遮罩
      ctx.fillStyle = 'rgba(34, 197, 94, 0.10)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (realPuzzleX !== null && realPuzzleX !== undefined) {
        const cx = realPuzzleX + puzzleSize / 2;
        const cy = puzzleY + puzzleSize / 2;
        const r = puzzleSize / 2 - 2;

        // 白色填充圆
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#5E4E3E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 绿色外圆
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.stroke();

        // 勾号（按比例缩放）
        const s = r * 0.35;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = r * 0.13;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - s, cy);
        ctx.lineTo(cx - s * 0.2, cy + s * 0.8);
        ctx.lineTo(cx + s, cy - s * 0.8);
        ctx.stroke();
      }

      ctx.restore();
    },

    drawPuzzle() {
      const ctx = this.data.puzzleCtx;
      if (!ctx) return;
      const { puzzleSize } = this.data;
      ctx.clearRect(0, 0, puzzleSize, puzzleSize);
      const cx = puzzleSize / 2, cy = puzzleSize / 2;
      const r = puzzleSize / 2 - 3;

      ctx.fillStyle = '#FF9F43';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#5E4E3E';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#5E4E3E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.stroke();
    },

    generateCaptcha() {
      const that = this;
      this.setData({ loading: true, verifySuccess: false, verifyFail: false, sliderX: 0, puzzleX: 0, dragging: false });
      api.request('/auth/generate-captcha', 'POST', {
        canvas_width: Math.floor(this.data.canvasWidth),
        canvas_height: Math.floor(this.data.canvasHeight)
      }, false)
        .then(res => {
          if (res.code === 200 && res.data) {
            const { captcha_token, canvas_width, canvas_height, puzzle_size, puzzle_x, puzzle_y } = res.data;
            that.setData({
              captchaToken: captcha_token,
              canvasWidth: canvas_width,
              canvasHeight: canvas_height,
              puzzleSize: puzzle_size,
              realPuzzleX: puzzle_x,
              puzzleY: puzzle_y,
              puzzleX: 0,
              sliderX: 0,
              sliderMaxX: canvas_width - puzzle_size,
              loading: false,
              sliderText: '向右滑动完成拼图'
            }, () => {
              that.updateStyles();
              that.drawBackground();
              that.drawPuzzle();
            });
          } else {
            that.setData({ loading: false });
            wx.showToast({ title: res.msg || '生成失败', icon: 'none' });
          }
        })
        .catch(err => {
          console.error('生成验证码失败:', err);
          that.setData({ loading: false });
          wx.showToast({ title: '网络错误', icon: 'none' });
        });
    },

    verifyCaptcha(sliderX) {
      const that = this;
      this.setData({ loading: true });
      api.request('/auth/verify-captcha', 'POST', {
        captcha_token: this.data.captchaToken,
        slider_x: sliderX
      }, false)
        .then(res => {
          that.setData({ loading: false });
          if (res.code === 200) {
            that.setData({ verifySuccess: true, sliderText: '验证成功' }, () => {
              that.drawSuccessOverlay();
            });
            that.triggerEvent('success', { captchaToken: that.data.captchaToken });
          } else {
            // 失败：在画布上显示效果，滑块文字不变
            that.setData({ verifyFail: true }, () => {
              that.drawFailOverlay();
            });
            that.triggerEvent('fail', { message: res.msg || '验证失败' });
            setTimeout(() => { that.onRefresh(); }, 2000);
          }
        })
        .catch(err => {
          console.error('验证失败:', err);
          that.setData({ loading: false, verifyFail: true }, () => {
            that.drawFailOverlay();
          });
          setTimeout(() => { that.onRefresh(); }, 2000);
        });
    },

    onSliderTouchStart(e) {
      if (this.data.verifySuccess || this.data.loading) return;
      const query = this.createSelectorQuery().in(this);
      query.select('.slider-track').boundingClientRect((rect) => {
        if (rect) {
          this.sliderTrackLeft = rect.left;
          this.sliderButtonWidth = 48;
          this.setData({ dragging: true, verifyFail: false });
        }
      }).exec();
    },

    onSliderTouchMove(e) {
      if (!this.data.dragging || !this.sliderTrackLeft) return;
      const touchX = e.touches[0].pageX;
      let newX = touchX - this.sliderTrackLeft - this.sliderButtonWidth;
      if (newX < 0) newX = 0;
      if (newX > this.data.sliderMaxX) newX = this.data.sliderMaxX;
      this.setData({
        sliderX: newX,
        puzzleX: newX,
        puzzleStyle: `width: ${this.data.puzzleSize}px; height: ${this.data.puzzleSize}px; left: ${newX}px; top: ${this.data.puzzleY}px;`
      });
    },

    onSliderTouchEnd(e) {
      if (!this.data.dragging) return;
      this.setData({ dragging: false });
      this.verifyCaptcha(this.data.sliderX);
    },

    onRefresh() {
      this.setData({
        sliderX: 0, puzzleX: 0, dragging: false,
        verifySuccess: false, verifyFail: false,
        sliderText: '向右滑动完成拼图'
      }, () => { this.updateStyles(); });
      this.generateCaptcha();
    }
  },

  lifetimes: {
    attached() {
      this.updateStyles();
      this.setData({ _shouldGenerateCaptcha: true });
      this.initCanvas();
    }
  }
});
