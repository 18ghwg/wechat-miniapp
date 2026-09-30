const fs = require('fs');
const path = require('path');

describe('work log delete id handling', () => {
  let pageConfig;
  let pageInstance;
  let apiCallMock;
  let deleteMock;
  let getTodayMock;
  let getSummaryMock;
  let getPlansMock;
  let createPlanMock;
  let updatePlanMock;
  let deletePlanMock;
  let getTodayAttendanceMock;
  let showErrorMock;
  let wxMock;

  function createPageInstance(config) {
    const instance = {
      data: JSON.parse(JSON.stringify(config.data)),
      setData(updates) {
        Object.keys(updates).forEach((key) => {
          this.data[key] = updates[key];
        });
      }
    };

    Object.keys(config).forEach((key) => {
      if (key !== 'data') {
        instance[key] = config[key];
      }
    });

    return instance;
  }

  beforeEach(() => {
    jest.resetModules();

    deleteMock = jest.fn();
    getTodayMock = jest.fn(() => ({ code: 200, msg: 'ok', data: [] }));
    getSummaryMock = jest.fn(() => ({ code: 200, msg: 'ok', data: null }));
    getPlansMock = jest.fn(() => ({ code: 200, msg: 'ok', data: [] }));
    createPlanMock = jest.fn();
    updatePlanMock = jest.fn();
    deletePlanMock = jest.fn();
    getTodayAttendanceMock = jest.fn(() => ({
      code: 200,
      msg: 'ok',
      data: { attendance: null }
    }));
    apiCallMock = jest.fn((requestFn, _loadingText, successCallback) => {
      const response = requestFn() || { code: 200, msg: 'ok', data: null };
      if (successCallback) {
        successCallback(response);
      }
      return Promise.resolve(response);
    });
    showErrorMock = jest.fn();

    jest.doMock('../utils/api', () => ({
      API: {
        workLog: {
          getToday: getTodayMock,
          getSummary: getSummaryMock,
          getPlans: getPlansMock,
          createPlan: createPlanMock,
          updatePlan: updatePlanMock,
          deletePlan: deletePlanMock,
          delete: deleteMock
        },
        attendance: {
          getTodayAttendance: getTodayAttendanceMock
        }
      },
      apiCall: apiCallMock,
      showError: showErrorMock,
      showSuccess: jest.fn()
    }));

    jest.doMock('../utils/feature-usage', () => ({
      recordFeatureUsage: jest.fn()
    }));

    wxMock = {
      showModal: jest.fn(),
      pageScrollTo: jest.fn(),
      getStorageSync: jest.fn((key) => {
        if (key === 'userInfo') {
          return { real_name: '张三' };
        }
        return {};
      })
    };

    global.wx = wxMock;
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    require('../pages/work-log/index.js');
    pageInstance = createPageInstance(pageConfig);
  });

  test('unwraps api envelope before assigning logs', () => {
    const logs = [{ id: 12, content: '完成接口联调', log_type: 'work' }];
    getTodayMock.mockReturnValue({ code: 200, msg: '查询成功', data: logs });

    pageInstance.loadLogs();

    expect(getTodayMock).toHaveBeenCalledWith({ date: pageInstance.data.currentDate });
    expect(pageInstance.data.logs).toEqual(logs);
  });

  test('loads today attendance area from attendance api', () => {
    getTodayAttendanceMock.mockReturnValue({
      code: 200,
      msg: '查询成功',
      data: {
        attendance: {
          WorkStatus: '国内出差',
          Comment: '东区基地',
          WorkDate: pageInstance.data.currentDate
        }
      }
    });

    pageInstance.loadTodayAttendanceArea();

    expect(getTodayAttendanceMock).toHaveBeenCalledWith({
      real_name: '张三',
      work_date: pageInstance.data.currentDate
    });
    expect(pageInstance.data.attendanceArea).toBe('东区基地');
    expect(pageInstance.data.attendanceStatus).toBe('国内出差');
    expect(pageInstance.data.attendanceLoading).toBe(false);
  });

  test('loads summary preview with final group message format only', () => {
    const message = '日期：2026-05-13\n区域：东区基地\n日志：\n1. 完成设备巡检\n2. 处理告警';
    pageInstance.setData({ canSendSummary: true, currentDate: '2026-05-13' });
    getSummaryMock.mockReturnValue({
      code: 200,
      msg: '查询成功',
      data: {
        date: '2026-05-13',
        count: 2,
        message
      }
    });

    pageInstance.loadSummary();

    expect(getSummaryMock).toHaveBeenCalledWith({ date: '2026-05-13' });
    expect(pageInstance.data.summary.message).toBe(message);
    expect(pageInstance.data.summary.message).not.toContain('【工作日志汇总】');
    expect(pageInstance.data.summary.message).not.toContain('今日工作');
    expect(pageInstance.data.summary.message).not.toContain('后续计划');
    expect(pageInstance.data.summary.message).not.toContain('共 2 条记录');
  });

  test('work log page includes hand-drawn icon structure', () => {
    const wxml = fs.readFileSync(path.join(__dirname, '../pages/work-log/index.wxml'), 'utf8');
    const wxss = fs.readFileSync(path.join(__dirname, '../pages/work-log/index.wxss'), 'utf8');

    [
      'logbook-icon',
      'area-icon',
      'type-icon-{{item.value}}',
      'refresh-icon',
      'send-icon',
      'preview-icon',
      'plan-list-icon',
      'note-list-icon'
    ].forEach((className) => {
      expect(wxml).toContain(className);
    });

    [
      '.logbook-icon',
      '.area-pin-head',
      '.type-icon-work',
      '.refresh-icon',
      '.send-icon',
      '.preview-icon',
      '.plan-list-icon',
      '.note-list-icon'
    ].forEach((selector) => {
      expect(wxss).toContain(selector);
    });
  });

  test('loads persisted plans from backend', () => {
    const plans = [
      { id: 1, target: '完成东区巡检', status: 'pending' },
      { id: 2, target: '设备问题', result_summary: '已解决', status: 'completed' }
    ];
    getPlansMock.mockReturnValue({ code: 200, msg: '查询成功', data: plans });

    pageInstance.loadPlans();

    expect(getPlansMock).toHaveBeenCalledTimes(1);
    expect(getPlansMock).toHaveBeenCalledWith({ date: pageInstance.data.currentDate });
    expect(pageInstance.data.plans).toEqual(plans);
  });

  test('submits selected plan target to backend', () => {
    pageInstance.setData({
      logType: 'plan',
      planTarget: '完成东区巡检'
    });
    createPlanMock.mockReturnValue({
      code: 200,
      msg: 'ok',
      data: { id: 3, target: '完成东区巡检', status: 'pending' }
    });
    pageInstance.refreshAll = jest.fn();

    pageInstance.onSubmit();

    expect(createPlanMock).toHaveBeenCalledWith({
      date: pageInstance.data.currentDate,
      target: '完成东区巡检'
    });
    expect(pageInstance.refreshAll).toHaveBeenCalledTimes(1);
  });

  test('completes editing plan with result summary', () => {
    pageInstance.setData({
      logType: 'plan',
      editingPlanId: 5,
      planTarget: '设备问题',
      planResult: '更换模块后恢复'
    });
    updatePlanMock.mockReturnValue({
      code: 200,
      msg: 'ok',
      data: {
        id: 5,
        target: '设备问题',
        result_summary: '更换模块后恢复',
        status: 'completed',
        work_log: { id: 9, content: '设备问题：更换模块后恢复' }
      }
    });
    pageInstance.refreshAll = jest.fn();

    pageInstance.onCompleteEditingPlan();

    expect(updatePlanMock).toHaveBeenCalledWith(5, {
      target: '设备问题',
      result_summary: '更换模块后恢复',
      status: 'completed'
    });
    expect(pageInstance.refreshAll).toHaveBeenCalledTimes(1);
  });

  test('requires result before marking pending plan completed', () => {
    pageInstance.onTogglePlan({
      currentTarget: {
        dataset: {
          item: { id: 6, target: '设备问题', status: 'pending', result_summary: '' }
        }
      }
    });

    expect(showErrorMock).toHaveBeenCalledWith('请先填写计划成果');
    expect(updatePlanMock).not.toHaveBeenCalled();
    expect(pageInstance.data.editingPlanId).toBe(6);
  });

  test('uses unchecked area when user has no today attendance', () => {
    getTodayAttendanceMock.mockReturnValue({
      code: 200,
      msg: '今日未打卡',
      data: { attendance: null }
    });

    pageInstance.loadTodayAttendanceArea();

    expect(pageInstance.data.attendanceArea).toBe('今日未打卡');
    expect(pageInstance.data.attendanceLoading).toBe(false);
  });

  test('does not call delete api when dataset id is missing', () => {
    pageInstance.onDelete({ currentTarget: { dataset: {} } });

    expect(showErrorMock).toHaveBeenCalledWith('记录数据异常，请刷新后重试');
    expect(wxMock.showModal).not.toHaveBeenCalled();
    expect(apiCallMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  test('does not call delete api when dataset id is invalid text', () => {
    pageInstance.onDelete({ currentTarget: { dataset: { id: 'undefined' } } });

    expect(showErrorMock).toHaveBeenCalledWith('记录数据异常，请刷新后重试');
    expect(wxMock.showModal).not.toHaveBeenCalled();
    expect(apiCallMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  test('passes the record id to delete api after confirmation', () => {
    wxMock.showModal.mockImplementation(({ success }) => {
      success({ confirm: true });
    });
    pageInstance.refreshAll = jest.fn();

    pageInstance.onDelete({ currentTarget: { dataset: { id: 12 } } });

    expect(wxMock.showModal).toHaveBeenCalledTimes(1);
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith(12);
  });
});
