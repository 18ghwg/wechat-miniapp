// 天气严重程度自定义设置页面
const { API, request, apiCall, showError, showSuccess } = require('../../../utils/api');
const { getEnvironmentInfo } = require('../../../utils/environment');

Page({
  data: {
    loading: true,
    saving: false,
    
    // 当前配置
    currentConfig: {},
    presetType: 'standard',
    isCustom: false,
    
    // 预设配置
    presets: {
      conservative: {},
      standard: {},
      relaxed: {}
    },
    
    // 预设选项
    presetOptions: [
      { value: 'conservative', label: '保守型', icon: '👴👶', desc: '更敏感，适合老人小孩' },
      { value: 'standard', label: '标准型', icon: '👥', desc: '系统推荐，大多数人' },
      { value: 'relaxed', label: '宽松型', icon: '💪', desc: '减少预警，年轻人' }
    ],
    
    // 天气类型分类
    weatherCategories: [
      {
        name: '降雨天气',
        icon: '☔',
        expanded: false,
        weathers: ['小雨', '中雨', '大雨', '暴雨', '大暴雨', '特大暴雨', '阵雨', '雷阵雨', '雷阵雨伴有冰雹'],
        colors: {}
      },
      {
        name: '降雪天气',
        icon: '❄️',
        expanded: false,
        weathers: ['小雪', '中雪', '大雪', '暴雪'],
        colors: {}
      },
      {
        name: '能见度影响',
        icon: '🌫️',
        expanded: false,
        weathers: ['轻雾', '雾', '浓雾', '强浓雾', '霾', '中度霾', '重度霾', '严重霾'],
        colors: {}
      },
      {
        name: '其他极端天气',
        icon: '⚠️',
        expanded: false,
        weathers: ['浮尘', '扬沙', '沙尘暴', '强沙尘暴', '冰雹', '冻雨'],
        colors: {}
      },
      {
        name: '晴好天气',
        icon: '☀️',
        expanded: false,
        weathers: ['晴', '多云', '阴'],
        colors: {}
      }
    ],
    
    // 严重程度选项 - 使用马卡龙主题颜色
    severityLevels: [
      { value: 0, label: '0级', desc: '无影响', color: '#E0E0E0' },
      { value: 1, label: '1级', desc: '轻度', color: '#B9FBC0' },    // mint green
      { value: 2, label: '2级', desc: '一般', color: '#FFD93D' },    // yellow
      { value: 3, label: '3级', desc: '较重', color: '#FF9F43' },    // peach/orange
      { value: 4, label: '4级', desc: '严重', color: '#FFB3BA' },    // pink
      { value: 5, label: '5级', desc: '极严重', color: '#FF4D4D' }   // destructive red
    ],
    
    // 高级设置展开状态
    showAdvanced: false,
    
    // 用户信息
    userInfo: null,
    isAdmin: false
  },
  
  onLoad(options) {
    console.log('🔍 天气严重程度设置 - 页面加载');
    this.checkPermission();
    this.loadConfig();
  },

  onShow() {
    // 每次显示页面时重新检查权限
    this.checkPermission();
  },

  // 检查用户权限
  checkPermission() {
    // 使用与用户中心一致的用户信息获取方式
    const userInfo = wx.getStorageSync('userInfo');
    console.log('🔍 天气严重程度设置 - 权限检查:', userInfo);
    
    if (!userInfo) {
      console.log('❌ 未获取到用户信息');
      wx.showModal({
        title: '权限不足',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.reLaunch({ url: '/pages/login/index' });
        }
      });
      return false;
    }
    
    // 使用与用户中心一致的管理员判断逻辑
    const isAdmin = this.isAdminUser(userInfo);
    console.log('🔍 管理员权限检查结果:', isAdmin);
    
    this.setData({
      userInfo: userInfo,
      isAdmin: isAdmin
    });

    if (!isAdmin) {
      console.log('❌ 非管理员用户，权限不足');
      wx.showModal({
        title: '权限不足',
        content: '只有管理员才能访问天气严重程度设置',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return false;
    }
    
    console.log('✅ 权限检查通过');
    return true;
  },

  // 判断是否为管理员（与用户中心保持一致）
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }
    
    // 方法1：检查 is_admin 字段（Web绑定用户）
    if (userInfo.is_admin === true || userInfo.is_admin === 1) {
      return true;
    }
    
    // 方法2：检查 user_level 字段（小程序用户）
    if (userInfo.user_level === 'admin' || userInfo.user_level === 'Admin' || userInfo.user_level === 'ADMIN') {
      return true;
    }
    
    // 方法3：检查 user_level 数值（兼容旧版本）
    if (typeof userInfo.user_level === 'number' && userInfo.user_level >= 10) {
      return true;
    }
    
    return false;
  },
  
  // 加载配置
  loadConfig() {
    if (!this.checkPermission()) {
      return;
    }

    this.setData({ loading: true });

    // ✅ 使用API封装，自动添加签名
    API.weatherSeverity.getConfig()
      .then((data) => {
        console.log('获取配置成功:', data);
        
        const { current_config, preset_type, is_custom, presets } = data.data;
        
        // 更新天气分类的颜色映射
        this.updateWeatherColors(current_config);
        
        this.setData({
          currentConfig: current_config,
          presetType: preset_type,
          isCustom: is_custom,
          presets: presets,
          loading: false
        });
        
        console.log('✅ 配置加载成功');
      })
      .catch((err) => {
        console.error('❌ 获取配置失败:', err);
        showError(err.message || '获取配置失败');
        this.setData({ loading: false });
      });
  },
  
  // 选择预设配置
  onPresetChange(e) {
    const presetType = e.currentTarget.dataset.preset;
    console.log('📦 选择预设:', presetType);
    
    wx.showModal({
      title: '应用预设配置',
      content: `确定要应用${this.data.presetOptions.find(p => p.value === presetType).label}吗？`,
      success: (res) => {
        if (res.confirm) {
          this.applyPreset(presetType);
        }
      }
    });
  },
  
  // 应用预设配置
  applyPreset(presetType) {
    wx.showLoading({ title: '应用中...' });
    
    // ✅ 使用API封装，自动添加签名
    API.weatherSeverity.applyPreset(presetType)
      .then((data) => {
        wx.hideLoading();
        showSuccess(data.msg || '应用成功');
        // 重新加载配置
        this.loadConfig();
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('❌ 应用预设失败:', err);
        showError(err.message || '应用失败');
      });
  },
  
  // 切换分类展开状态
  toggleCategory(e) {
    const index = e.currentTarget.dataset.index;
    const categories = this.data.weatherCategories;
    categories[index].expanded = !categories[index].expanded;
    this.setData({ weatherCategories: categories });
  },
  
  // 修改天气严重程度
  onSeverityChange(e) {
    const weather = e.currentTarget.dataset.weather;
    const currentSeverity = this.data.currentConfig[weather] || 0;
    
    wx.showActionSheet({
      itemList: this.data.severityLevels.map(l => `${l.label} - ${l.desc}`),
      success: (res) => {
        const newSeverity = res.tapIndex;
        if (newSeverity !== currentSeverity) {
          const config = Object.assign({}, this.data.currentConfig);
          config[weather] = newSeverity;
          this.setData({
            currentConfig: config,
            isCustom: true,
            presetType: 'custom'
          });
        }
      }
    });
  },
  
  // 切换高级设置
  toggleAdvanced() {
    this.setData({
      showAdvanced: !this.data.showAdvanced
    });
  },
  
  // 重置为推荐配置
  onReset() {
    wx.showModal({
      title: '重置配置',
      content: '确定要重置为标准型推荐配置吗？',
      success: (res) => {
        if (res.confirm) {
          this.applyPreset('standard');
        }
      }
    });
  },
  
  // 保存配置
  onSave() {
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });
    
    console.log('保存严重程度配置:', this.data.currentConfig);
    
    // ✅ 使用API封装，自动添加签名
    API.weatherSeverity.saveConfig({ weather_severity_config: this.data.currentConfig })
      .then((data) => {
        wx.hideLoading();
        this.setData({ saving: false });
        showSuccess(data.msg || '保存成功');
        // 重新加载配置
        setTimeout(() => {
          this.loadConfig();
        }, 1000);
      })
      .catch((err) => {
        wx.hideLoading();
        this.setData({ saving: false });
        console.error('❌ 保存失败:', err);
        showError(err.message || '保存失败');
      });
  },
  
  // 获取严重程度标签
  getSeverityLabel(severity) {
    const level = this.data.severityLevels.find(l => l.value === severity);
    return level ? `${level.label} - ${level.desc}` : `${severity}级`;
  },
  
  // 获取严重程度颜色
  getSeverityColor(severity) {
    const level = this.data.severityLevels.find(l => l.value === severity);
    return level ? level.color : '#999';
  },
  
  // 更新天气分类的颜色映射
  updateWeatherColors(config) {
    const categories = this.data.weatherCategories;
    categories.forEach(category => {
      const colors = {};
      category.weathers.forEach(weather => {
        const severity = config[weather] || 0;
        colors[weather] = this.getSeverityColor(severity);
      });
      category.colors = colors;
    });
    this.setData({ weatherCategories: categories });
  }
});
