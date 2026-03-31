Component({
  properties: {
    title: {
      type: String,
      value: 'Cron表达式编辑器'
    },
    fieldName: {
      type: String,
      value: '时间单位'
    },
    unit: {
      type: String,
      value: ''
    },
    min: {
      type: Number,
      value: 0
    },
    max: {
      type: Number,
      value: 59
    },
    defaultValue: {
      type: String,
      value: '*'
    },
    showRangeStep: {
      type: Boolean,
      value: true
    }
  },

  data: {
    selectedType: 'any',
    expression: '*',
    expressionValid: true,
    expressionMessage: '�有效：每个值',
    
    // 各种类型的值
    specificValue: '',
    intervalValue: '',
    rangeStart: '',
    rangeEnd: '',
    rangeStep: '',
    multipleValues: ''
  },

  lifetimes: {
    attached() {
      this.parseExpression(this.data.defaultValue);
    }
  },

  methods: {
    /**
     * 解析现有表达式
     */
    parseExpression(expr) {
      if (!expr || expr === '*') {
        this.setData({ selectedType: 'any', expression: '*' });
        return;
      }

      // */n 格式（间隔）
      if (expr.startsWith('*/')) {
        const value = expr.substring(2);
        this.setData({
          selectedType: 'interval',
          intervalValue: value,
          expression: expr
        });
        return;
      }

      // a-b �a-b/c 格式（范围）
      if (expr.includes('-')) {
        const parts = expr.split('/');
        const range = parts[0].split('-');
        this.setData({
          selectedType: 'range',
          rangeStart: range[0],
          rangeEnd: range[1],
          rangeStep: parts[1] || '',
          expression: expr
        });
        return;
      }

      // a,b,c 格式（多个值）
      if (expr.includes(',')) {
        this.setData({
          selectedType: 'multiple',
          multipleValues: expr,
          expression: expr
        });
        return;
      }

      // 单个值
      this.setData({
        selectedType: 'specific',
        specificValue: expr,
        expression: expr
      });
    },

    /**
     * 选择表达式类型
     */
    selectType(e) {
      const type = e.currentTarget.dataset.type;
      this.setData({ selectedType: type });
      this.generateExpression();
    },

    /**
     * 指定值变化
     */
    onSpecificChange(e) {
      this.setData({ specificValue: e.detail.value });
      this.generateExpression();
    },

    /**
     * 间隔值变化
     */
    onIntervalChange(e) {
      this.setData({ intervalValue: e.detail.value });
      this.generateExpression();
    },

    /**
     * 范围起始值变化
     */
    onRangeStartChange(e) {
      this.setData({ rangeStart: e.detail.value });
      this.generateExpression();
    },

    /**
     * 范围结束值变化
     */
    onRangeEndChange(e) {
      this.setData({ rangeEnd: e.detail.value });
      this.generateExpression();
    },

    /**
     * 范围间隔变化
     */
    onRangeStepChange(e) {
      this.setData({ rangeStep: e.detail.value });
      this.generateExpression();
    },

    /**
     * 多个值变化
     */
    onMultipleChange(e) {
      this.setData({ multipleValues: e.detail.value });
      this.generateExpression();
    },

    /**
     * 快捷选择（用于星期和月份）
     */
    onQuickSelect(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({ 
        selectedType: 'multiple',
        multipleValues: value 
      });
      this.generateExpression();
    },

    /**
     * 验证表达式
     */
    validateExpression(expression) {
      const { min, max } = this.data;
      
      // 任意值
      if (expression === '*') {
        return { valid: true, message: '�有效：每个值' };
      }
      
      // */n 格式
      if (/^\*\/\d+$/.test(expression)) {
        const interval = parseInt(expression.substring(2));
        if (interval > 0 && interval <= max) {
          return { valid: true, message: `�有效：每${interval}个` };
        }
        return { valid: false, message: '�无效：间隔值超出范围' };
      }
      
      // a-b/c 格式
      if (/^\d+-\d+\/\d+$/.test(expression)) {
        const match = expression.match(/^(\d+)-(\d+)\/(\d+)$/);
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const step = parseInt(match[3]);
        
        if (start >= min && end <= max && start < end && step > 0) {
          return { valid: true, message: `�有效：${start}到${end}，每${step}个` };
        }
        return { valid: false, message: '�无效：范围或间隔值错误' };
      }
      
      // a-b 格式
      if (/^\d+-\d+$/.test(expression)) {
        const [start, end] = expression.split('-').map(v => parseInt(v));
        if (start >= min && end <= max && start < end) {
          return { valid: true, message: `�有效：${start}到${end}` };
        }
        return { valid: false, message: '�无效：范围值错误' };
      }
      
      // a,b,c 格式
      if (expression.includes(',')) {
        const values = expression.split(',').map(v => v.trim());
        const numbers = values.map(v => parseInt(v));
        
        if (numbers.every(n => !isNaN(n) && n >= min && n <= max)) {
          return { valid: true, message: `�有效：指定值 ${values.join(', ')}` };
        }
        return { valid: false, message: '�无效：列表中有无效值' };
      }
      
      // 单个数字
      const num = parseInt(expression);
      if (!isNaN(num) && num >= min && num <= max) {
        return { valid: true, message: `�有效：固定值 ${num}` };
      }
      
      return { valid: false, message: '�无效：格式错误' };
    },

    /**
     * 生成表达式
     */
    generateExpression() {
      const { selectedType, specificValue, intervalValue, rangeStart, rangeEnd, rangeStep, multipleValues } = this.data;
      let expression = '*';

      switch (selectedType) {
        case 'any':
          expression = '*';
          break;

        case 'specific':
          expression = specificValue || '*';
          break;

        case 'interval':
          expression = intervalValue ? `*/${intervalValue}` : '*';
          break;

        case 'range':
          if (rangeStart && rangeEnd) {
            expression = `${rangeStart}-${rangeEnd}`;
            if (rangeStep) {
              expression += `/${rangeStep}`;
            }
          }
          break;

        case 'multiple':
          expression = multipleValues || '*';
          break;
      }

      // 验证表达式
      const validation = this.validateExpression(expression);
      
      this.setData({ 
        expression,
        expressionValid: validation.valid,
        expressionMessage: validation.message
      });
    },

    /**
     * 取消
     */
    onCancel() {
      this.triggerEvent('cancel');
    },

    /**
     * 确认
     */
    onConfirm() {
      this.triggerEvent('confirm', {
        expression: this.data.expression
      });
    }
  }
});

