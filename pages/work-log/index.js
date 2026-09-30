const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const featureUsage = require('../../utils/feature-usage');

function todayText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isAdminUser(userInfo) {
  if (!userInfo) {
    return false;
  }
  if (userInfo.is_admin === true || userInfo.is_admin === 1) {
    return true;
  }
  if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') {
    return true;
  }
  if (userInfo.web_user_level && String(userInfo.web_user_level).toLowerCase() === 'admin') {
    return true;
  }
  if (Array.isArray(userInfo.permissions)) {
    return userInfo.permissions.some((permission) => {
      if (typeof permission === 'string') {
        return permission === 'admin';
      }
      return permission && (permission.code === 'admin' || permission.permission_code === 'admin');
    });
  }
  return false;
}

function unwrapApiData(response, fallback) {
  if (response && Object.prototype.hasOwnProperty.call(response, 'data')) {
    return response.data;
  }
  return response === undefined ? fallback : response;
}

function isValidRecordId(id) {
  if (id === undefined || id === null || id === '') {
    return false;
  }
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function getUserRealName(userInfo) {
  if (!userInfo) {
    return '';
  }
  return userInfo.real_name || userInfo.name || userInfo.web_username || userInfo.nickname || '';
}

function normalizeAttendanceArea(attendance) {
  if (!attendance) {
    return '今日未打卡';
  }

  const workStatus = attendance.work_status || attendance.WorkStatus || '';
  const comment = attendance.comment || attendance.Comment || '';
  if ((workStatus === '国内出差' || workStatus === '国外出差') && comment) {
    return comment;
  }
  if (comment && comment !== workStatus) {
    return comment;
  }
  return comment || workStatus || '今日未打卡';
}

Page({
  data: {
    currentDate: todayText(),
    logType: 'work',
    content: '',
    planTarget: '',
    planResult: '',
    editingPlanId: null,
    editingId: null,
    statusBarHeight: 0,
    logs: [],
    plans: [],
    summary: null,
    attendanceArea: '',
    attendanceStatus: '',
    attendanceLoading: false,
    loading: false,
    submitting: false,
    sending: false,
    canSendSummary: false,
    showSummary: true,
    typeOptions: [
      { value: 'work', label: '工作' },
      { value: 'plan', label: '计划' },
      { value: 'blocker', label: '阻塞' },
      { value: 'other', label: '其他' }
    ]
  },

  onLoad() {
    featureUsage.recordFeatureUsage('work-log', '工作日志', '📝');
    let statusBarHeight = 0;
    try {
      statusBarHeight = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 0;
    } catch (error) {
      statusBarHeight = 0;
    }
    this.setData({
      canSendSummary: isAdminUser(wx.getStorageSync('userInfo')),
      statusBarHeight: statusBarHeight + 9
    });
    this.refreshAll();
    this.loadTodayAttendanceArea();
  },

  onPullDownRefresh() {
    this.refreshAll().finally(() => wx.stopPullDownRefresh());
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  toggleSummary() {
    this.setData({ showSummary: !this.data.showSummary });
  },

  refreshAll() {
    this.setData({ loading: true });
    const tasks = [this.loadLogs(), this.loadPlans()];
    if (this.data.canSendSummary) {
      tasks.push(this.loadSummary());
    } else {
      this.setData({ summary: null });
    }
    return Promise.all(tasks)
      .finally(() => this.setData({ loading: false }));
  },

  loadTodayAttendanceArea() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const realName = getUserRealName(userInfo);
    if (!realName) {
      this.setData({
        attendanceArea: '未完善姓名',
        attendanceStatus: '',
        attendanceLoading: false
      });
      return Promise.resolve();
    }

    this.setData({ attendanceLoading: true });
    return apiCall(
      () => API.attendance.getTodayAttendance({
        real_name: realName,
        work_date: this.data.currentDate
      }),
      null,
      (response) => {
        const data = unwrapApiData(response, {});
        const attendance = data && data.attendance ? data.attendance : null;
        this.setData({
          attendanceArea: normalizeAttendanceArea(attendance),
          attendanceStatus: attendance ? (attendance.work_status || attendance.WorkStatus || '') : '',
          attendanceLoading: false
        });
      },
      () => {
        this.setData({
          attendanceArea: '今日未打卡',
          attendanceStatus: '',
          attendanceLoading: false
        });
      }
    );
  },

  loadLogs() {
    return apiCall(
      () => API.workLog.getToday({ date: this.data.currentDate }),
      null,
      (response) => {
        const logs = unwrapApiData(response, []);
        this.setData({ logs: Array.isArray(logs) ? logs : [] });
      },
      (error) => {
        showError(error.message || '加载工作日志失败');
      }
    );
  },

  loadSummary() {
    return apiCall(
      () => API.workLog.getSummary({ date: this.data.currentDate }),
      null,
      (response) => {
        this.setData({ summary: unwrapApiData(response, null) || null });
      },
      () => {}
    );
  },

  loadPlans() {
    return apiCall(
      () => API.workLog.getPlans({ date: this.data.currentDate }),
      null,
      (response) => {
        const plans = unwrapApiData(response, []);
        this.setData({ plans: Array.isArray(plans) ? plans : [] });
      },
      (error) => {
        showError(error.message || '加载计划失败');
      }
    );
  },

  onTypeSelect(e) {
    const nextType = e.currentTarget.dataset.value;
    const updates = { logType: nextType };
    if (nextType !== 'plan') {
      updates.editingPlanId = null;
      updates.planTarget = '';
      updates.planResult = '';
    } else if (this.data.content && !this.data.planTarget) {
      updates.planTarget = this.data.content;
      updates.content = '';
    }
    this.setData(updates);
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onPlanTargetInput(e) {
    this.setData({ planTarget: e.detail.value });
  },

  onPlanResultInput(e) {
    this.setData({ planResult: e.detail.value });
  },

  onSubmit() {
    if (this.data.submitting) {
      return;
    }

    if (this.data.logType === 'plan') {
      this.submitPlan();
      return;
    }

    const content = (this.data.content || '').trim();
    if (!content) {
      showError('请输入工作内容或计划');
      return;
    }

    this.setData({ submitting: true });
    const requestAction = this.data.editingId
      ? () => API.workLog.update(this.data.editingId, {
          log_type: this.data.logType,
          content
        })
      : () => API.workLog.create({
          date: this.data.currentDate,
          log_type: this.data.logType,
          content
        });

    apiCall(
      requestAction,
      this.data.editingId ? '保存中...' : '记录中...',
      () => {
        showSuccess(this.data.editingId ? '已保存' : '已记录');
        this.setData({ content: '', editingId: null, logType: 'work' });
        this.refreshAll();
        this.loadTodayAttendanceArea();
      },
      (error) => {
        showError(error.message || '记录失败');
      }
    ).finally(() => {
      this.setData({ submitting: false });
    });
  },

  submitPlan() {
    const target = (this.data.planTarget || '').trim();
    if (!target) {
      showError('请输入计划目标');
      return;
    }

    this.setData({ submitting: true });
    const requestAction = this.data.editingPlanId
      ? () => API.workLog.updatePlan(this.data.editingPlanId, {
          target,
          result_summary: this.data.planResult || ''
        })
      : () => API.workLog.createPlan({
          date: this.data.currentDate,
          target
        });

    apiCall(
      requestAction,
      this.data.editingPlanId ? '保存中...' : '保存计划中...',
      () => {
        showSuccess(this.data.editingPlanId ? '计划已保存' : '计划已添加');
        this.setData({
          planTarget: '',
          planResult: '',
          editingPlanId: null,
          logType: 'work'
        });
        this.refreshAll();
      },
      (error) => {
        showError(error.message || '保存计划失败');
      }
    ).finally(() => {
      this.setData({ submitting: false });
    });
  },

  onEdit(e) {
    const { item } = e.currentTarget.dataset;
    if (!item || !isValidRecordId(item.id)) {
      showError('记录数据异常，请刷新后重试');
      return;
    }
    this.setData({
      editingId: item.id,
      logType: item.log_type || 'work',
      content: item.content || ''
    });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onEditPlan(e) {
    const { item } = e.currentTarget.dataset;
    if (!item || !isValidRecordId(item.id)) {
      showError('计划数据异常，请刷新后重试');
      return;
    }
    this.setData({
      editingPlanId: item.id,
      logType: 'plan',
      planTarget: item.target || '',
      planResult: item.result_summary || '',
      editingId: null,
      content: ''
    });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onCancelEdit() {
    this.setData({
      editingId: null,
      logType: 'work',
      content: '',
      editingPlanId: null,
      planTarget: '',
      planResult: ''
    });
  },

  onTogglePlan(e) {
    const { item } = e.currentTarget.dataset;
    if (!item || !isValidRecordId(item.id)) {
      showError('计划数据异常，请刷新后重试');
      return;
    }

    const isCompleted = item.status === 'completed';
    const nextStatus = isCompleted ? 'pending' : 'completed';
    if (!isCompleted && !(item.result_summary || '').trim()) {
      this.setData({
        editingPlanId: item.id,
        logType: 'plan',
        planTarget: item.target || '',
        planResult: item.result_summary || '',
        editingId: null,
        content: ''
      });
      showError('请先填写计划成果');
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
      return;
    }

    apiCall(
      () => API.workLog.updatePlan(item.id, {
        status: nextStatus,
        target: item.target,
        result_summary: item.result_summary || ''
      }),
      nextStatus === 'completed' ? '完成计划中...' : '恢复计划中...',
      () => {
        showSuccess(nextStatus === 'completed' ? '计划已完成' : '计划已恢复');
        this.refreshAll();
      },
      (error) => {
        showError(error.message || '更新计划失败');
      }
    );
  },

  onCompleteEditingPlan() {
    const target = (this.data.planTarget || '').trim();
    const result = (this.data.planResult || '').trim();
    if (!this.data.editingPlanId || !isValidRecordId(this.data.editingPlanId)) {
      showError('请先选择计划');
      return;
    }
    if (!target) {
      showError('请输入计划目标');
      return;
    }
    if (!result) {
      showError('请填写计划成果');
      return;
    }

    this.setData({ submitting: true });
    apiCall(
      () => API.workLog.updatePlan(this.data.editingPlanId, {
        target,
        result_summary: result,
        status: 'completed'
      }),
      '完成计划中...',
      () => {
        showSuccess('计划已完成');
        this.setData({
          planTarget: '',
          planResult: '',
          editingPlanId: null,
          logType: 'work'
        });
        this.refreshAll();
      },
      (error) => {
        showError(error.message || '完成计划失败');
      }
    ).finally(() => {
      this.setData({ submitting: false });
    });
  },

  onDeletePlan(e) {
    const { id } = e.currentTarget.dataset;
    if (!isValidRecordId(id)) {
      showError('计划数据异常，请刷新后重试');
      return;
    }

    wx.showModal({
      title: '删除计划',
      content: '确定删除这条计划吗？',
      confirmText: '删除',
      confirmColor: '#E53935',
      success: (res) => {
        if (!res.confirm) return;
        apiCall(
          () => API.workLog.deletePlan(id),
          '删除中...',
          () => {
            showSuccess('计划已删除');
            this.refreshAll();
          },
          (error) => {
            showError(error.message || '删除计划失败');
          }
        );
      }
    });
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    if (!isValidRecordId(id)) {
      showError('记录数据异常，请刷新后重试');
      return;
    }

    wx.showModal({
      title: '删除记录',
      content: '确定删除这条工作日志吗？',
      confirmText: '删除',
      confirmColor: '#E53935',
      success: (res) => {
        if (!res.confirm) return;
        apiCall(
          () => API.workLog.delete(id),
          '删除中...',
          () => {
            showSuccess('已删除');
            this.refreshAll();
          },
          (error) => {
            showError(error.message || '删除失败');
          }
        );
      }
    });
  },

  onSendSummary() {
    if (this.data.sending) {
      return;
    }
    if (!this.data.canSendSummary) {
      showError('权限不足，需要管理员权限');
      return;
    }
    if (!this.data.summary || !this.data.summary.count) {
      showError('今天暂无可发送的工作日志');
      return;
    }

    this.setData({ sending: true });
    apiCall(
      () => API.workLog.sendSummary({ date: this.data.currentDate }),
      '发送中...',
      (response) => {
        const data = unwrapApiData(response, null);
        if (data && data.skipped) {
          showError(data.msg || '暂无日志可发送');
          return;
        }
        const groupName = data && data.group_name ? data.group_name : '测试群';
        showSuccess(`已发送到${groupName}`);
        this.loadSummary();
      },
      (error) => {
        showError(error.message || '发送失败');
      }
    ).finally(() => {
      this.setData({ sending: false });
    });
  }
});
