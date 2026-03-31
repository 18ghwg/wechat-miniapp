/**
 * RollingNumber 组件 - 数值滚动动画
 * 模拟 React 端 useSpring 的平滑数值过渡效果
 * 使用弹簧物理模型（stiffness + damping）实现自然的数值滚动
 */
Component({
  properties: {
    // 目标数值（字符串）
    value: {
      type: String,
      value: '0',
      observer: 'onValueChange'
    },
    // 小数精度
    precision: {
      type: Number,
      value: 2
    },
    // 动画时长 ms（弹簧模型下作为参考，实际由 stiffness/damping 决定）
    duration: {
      type: Number,
      value: 1200
    }
  },

  data: {
    displayValue: '0'
  },

  lifetimes: {
    attached() {
      this._currentValue = 0;
      this._velocity = 0;
      this._animFrame = null;
      this._lastTime = 0;
      // 初始化显示
      const num = parseFloat(this.properties.value) || 0;
      this._currentValue = num;
      this._targetValue = num;
      this.setData({ displayValue: num.toFixed(this.properties.precision) });
    },
    detached() {
      this._stopAnimation();
    }
  },

  methods: {
    _stopAnimation() {
      if (this._animFrame) {
        clearTimeout(this._animFrame);
        this._animFrame = null;
      }
    },

    onValueChange(newVal) {
      const target = parseFloat(newVal) || 0;
      this._targetValue = target;

      // 如果差值极小，直接设置
      if (Math.abs(target - this._currentValue) < 0.0001) {
        this._currentValue = target;
        this.setData({ displayValue: target.toFixed(this.properties.precision) });
        return;
      }

      // 启动弹簧动画
      this._stopAnimation();
      this._lastTime = Date.now();
      this._runSpring();
    },

    /**
     * 弹簧物理模型动画
     * 匹配 React useSpring({ stiffness: 50, damping: 20 })
     */
    _runSpring() {
      const stiffness = 50;
      const damping = 20;
      const precision = this.properties.precision;
      const mass = 1;

      const step = () => {
        const now = Date.now();
        // 限制 dt 避免跳帧
        const dt = Math.min((now - this._lastTime) / 1000, 0.064);
        this._lastTime = now;

        const displacement = this._currentValue - this._targetValue;
        // 弹簧力 = -stiffness * displacement - damping * velocity
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * this._velocity;
        const acceleration = (springForce + dampingForce) / mass;

        this._velocity += acceleration * dt;
        this._currentValue += this._velocity * dt;

        // 检查是否收敛
        const isSettled = Math.abs(this._velocity) < 0.001 && Math.abs(displacement) < 0.0001;

        if (isSettled) {
          this._currentValue = this._targetValue;
          this._velocity = 0;
          this.setData({ displayValue: this._targetValue.toFixed(precision) });
          this._animFrame = null;
          return;
        }

        this.setData({ displayValue: this._currentValue.toFixed(precision) });

        // 约 30fps，用 setTimeout 模拟 requestAnimationFrame
        this._animFrame = setTimeout(step, 33);
      };

      step();
    }
  }
});
