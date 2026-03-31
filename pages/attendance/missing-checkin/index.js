const { API, apiCall } = require('../../../utils/api');

Page({
  data: {
    missedDateList: [],   // [{dateStr, display, weekday, selected}]
    typeOptions: [
      { id: 'office', label: '公司上班', iconPath: '/assets/icons/briefcase.png', iconBg: '#DBEAFE', selectedBg: '#DBEAFE' },
      { id: 'domestic', label: '国内出差', iconPath: '/assets/icons/map-pin.png', iconBg: '#FFEDD5', selectedBg: '#FFEDD5' },
      { id: 'international', label: '国外出差', iconPath: '/assets/icons/plane.png', iconBg: '#FCE7F3', selectedBg: '#FCE7F3' },
      { id: 'rest', label: '休息', iconPath: '/assets/icons/coffee.png', iconBg: '#DCFCE7', selectedBg: '#DCFCE7' }
    ],
    selectedType: 'office',
    selectedCount: 0,
    locationStr: '',
    subsidy: '',
    // Progress
    isSubmitting: false,
    progress: 0,
    currentProcessingDate: '',
    // Result
    showResult: false,
    resultSuccess: true,
    resultMsg: ''
  },

  onLoad(options) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    let missedDays = [];

    if (options.missedDays) {
      try {
        missedDays = JSON.parse(decodeURIComponent(options.missedDays));
      } catch (e) {
        console.error('解析漏打卡日期失败:', e);
      }
    }

    // 预选日期（从日历点击漏打卡日期进入时）
    const presetDate = options.date || '';

    // 转换为列表格式，按日期倒序
    const missedDateList = missedDays
      .sort((a, b) => b.localeCompare(a))
      .map(dateStr => {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return {
          dateStr: dateStr,
          display: parts[1] + '/' + parts[2],
          weekday: weekdays[d.getDay()],
          selected: dateStr === presetDate
        };
      });

    const selectedCount = missedDateList.filter(d => d.selected).length;
    this.setData({ missedDateList, selectedCount });
  },

  goBack() {
    wx.navigateBack();
  },

  onToggleDate(e) {
    const idx = e.currentTarget.dataset.index;
    const key = `missedDateList[${idx}].selected`;
    const newVal = !this.data.missedDateList[idx].selected;
    this.setData({ [key]: newVal });
    const selectedCount = this.data.missedDateList.filter(d => d.selected).length;
    this.setData({ selectedCount });
  },

  onSelectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  onLocationInput(e) {
    this.setData({ locationStr: e.detail.value });
  },

  onSubsidyInput(e) {
    this.setData({ subsidy: e.detail.value });
  },

  async onSubmit() {
    const selectedDates = this.data.missedDateList.filter(d => d.selected);
    if (selectedDates.length === 0) {
      wx.showToast({ title: '请先选择漏打卡日期', icon: 'none' });
      return;
    }

    const { selectedType, locationStr, subsidy } = this.data;
    if ((selectedType === 'domestic' || selectedType === 'international') && !locationStr) {
      wx.showToast({ title: '请输入出差地点', icon: 'none' });
      return;
    }

    // 映射类型到中文
    const typeMap = { office: '公司上班', domestic: '国内出差', international: '国外出差', rest: '休息', compensatory: '调休' };
    const workStatus = typeMap[selectedType] || '公司上班';

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const realName = userInfo ? (userInfo.real_name || userInfo.nickname || '') : '';

    this.setData({ isSubmitting: true, progress: 0, currentProcessingDate: '' });

    const results = [];
    for (let i = 0; i < selectedDates.length; i++) {
      const item = selectedDates[i];
      this.setData({
        currentProcessingDate: item.display,
        progress: Math.round(((i) / selectedDates.length) * 100)
      });

      // 根据打卡类型生成 comment
      let comment = '';
      if (selectedType === 'domestic' || selectedType === 'international') {
        // 出差类型：comment 是出差地点（基地名）
        comment = locationStr;
      } else {
        // 公司上班或休息：comment 就是工作状态本身
        comment = workStatus;
      }

      try {
        await this._submitSingle({
          name: realName,
          work_date: item.dateStr,
          work_status: workStatus,
          comment: comment,
          business_trip_subsidy: subsidy || '0',
          business_trip_location: locationStr || ''
        });
        results.push({ date: item.dateStr, success: true });
      } catch (err) {
        results.push({ date: item.dateStr, success: false, error: err.message });
      }

      this.setData({ progress: Math.round(((i + 1) / selectedDates.length) * 100) });
    }

    // 上传到公盘（如果全部成功）
    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      try {
        await this._uploadToNetdisk(selectedDates.map(d => d.dateStr));
      } catch (e) {
        console.warn('公盘上传失败:', e);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;
    let msg = `成功为 ${successCount} 个工作日提交补卡申请。`;
    if (failedCount > 0) msg += `${failedCount} 个日期提交失败。`;
    if (selectedType !== 'office' && subsidy) msg += `出差补贴 ${subsidy} 元已进入预结算。`;
    if (allSuccess) msg += ' 审批单已自动流转。';

    this.setData({
      isSubmitting: false,
      showResult: true,
      resultSuccess: allSuccess,
      resultMsg: '接口返回：' + msg
    });
  },

  _submitSingle(data) {
    return new Promise((resolve, reject) => {
      apiCall(
        () => API.attendance.submit(data),
        null,
        () => resolve(),
        (err) => reject(err)
      );
    });
  },

  _uploadToNetdisk(dates) {
    const userInfo = wx.getStorageSync('userInfo');
    const realName = userInfo ? (userInfo.real_name || '') : '';
    if (!realName) return Promise.resolve();

    // 计算涉及的月份
    const months = [...new Set(dates.map(d => {
      const parts = d.split('-');
      return { year: parseInt(parts[0]), month: parseInt(parts[1]) };
    }))];

    // 为每个月份单独上传
    const uploadPromises = months.map(({ year, month }) => {
      return new Promise((resolve, reject) => {
        apiCall(
          () => API.attendance.uploadToNetdisk({
            name: realName,
            year: year,
            month: month
          }),
          null,
          () => resolve(),
          (err) => {
            console.warn(`上传 ${year}-${month} 失败:`, err);
            resolve(); // 即使失败也继续，不阻塞流程
          }
        );
      });
    });

    return Promise.all(uploadPromises);
  },

  onCloseResult() {
    this.setData({ showResult: false });
    if (this.data.resultSuccess) {
      wx.navigateBack();
    }
  }
});
