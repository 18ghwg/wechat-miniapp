describe('task management database tasks', () => {
  let pageConfig;
  let pageInstance;
  let getTasksMock;
  let pauseTaskMock;
  let resumeTaskMock;
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

    getTasksMock = jest.fn(() => Promise.resolve({
      code: 200,
      msg: 'ok',
      data: [
        {
          id: 1,
          task_id: 'send_daily_work_log_summary',
          task_name: '工作日志自动汇总',
          task_description: '每日发送工作日志汇总',
          source: 'database',
          is_enabled: 1,
          status: 'running',
          trigger_type: 'cron',
          cron_hour: '20',
          cron_minute: '0',
          cron_second: '0',
          cron_day: '*',
          cron_day_of_week: '*',
          cron_month: '*'
        },
        {
          id: 2,
          task_id: 'local_health_check',
          task_name: '本地健康检查',
          source: 'local',
          is_enabled: true,
          status: 'running',
          trigger_type: 'interval',
          interval_minutes: 5
        }
      ]
    }));
    pauseTaskMock = jest.fn(() => Promise.resolve({ code: 200, msg: 'ok' }));
    resumeTaskMock = jest.fn(() => Promise.resolve({ code: 200, msg: 'ok' }));
    showErrorMock = jest.fn();

    jest.doMock('../utils/api', () => ({
      API: {
        admin: {
          getTasks: getTasksMock,
          pauseTask: pauseTaskMock,
          resumeTask: resumeTaskMock
        }
      },
      apiCall: jest.fn(),
      showError: showErrorMock,
      showSuccess: jest.fn()
    }));

    jest.doMock('../utils/testMode', () => ({
      testModeManager: {
        isTestMode: jest.fn(() => false),
        setupPageHotReload: jest.fn()
      }
    }));

    jest.doMock('../utils/feature-usage', () => ({
      recordFeatureUsage: jest.fn()
    }));

    wxMock = {
      getStorageSync: jest.fn((key) => {
        if (key === 'userInfo') {
          return { is_admin: true };
        }
        return {};
      }),
      navigateTo: jest.fn(),
      showModal: jest.fn(),
      stopPullDownRefresh: jest.fn(),
      showToast: jest.fn()
    };

    global.wx = wxMock;
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    require('../pages/admin/task-management/list/index.js');
    pageInstance = createPageInstance(pageConfig);
  });

  test('loads database tasks from admin tasks api without feature whitelist', async () => {
    await pageInstance.loadTasks();

    expect(getTasksMock).toHaveBeenCalledTimes(1);
    expect(pageInstance.data.tasks).toHaveLength(2);

    const workLogTask = pageInstance.data.tasks[0];
    expect(workLogTask.task_id).toBe('send_daily_work_log_summary');
    expect(workLogTask.is_enabled).toBe(true);
    expect(workLogTask.trigger_desc).toBe('每天 20:00');
    expect(workLogTask.source).toBe('database');
  });

  test('edit navigation is generic for non-local tasks', () => {
    pageInstance.onEditTask({
      currentTarget: {
        dataset: {
          taskId: 'send_daily_work_log_summary'
        }
      }
    });

    expect(wxMock.navigateTo).toHaveBeenCalledWith({
      url: '/pages/admin/task-management/edit/index?task_id=send_daily_work_log_summary'
    });
  });

  test('local task source remains detectable so template hides edit controls', async () => {
    await pageInstance.loadTasks();

    const localTask = pageInstance.data.tasks.find(task => task.task_id === 'local_health_check');
    expect(localTask.source).toBe('local');
  });

  test('task click handlers tolerate missing event dataset', async () => {
    await pageInstance.loadTasks();

    await expect(pageInstance.onToggleTask({ currentTarget: { dataset: {} } })).resolves.toBeUndefined();
    await expect(pageInstance.onTogglePause({ currentTarget: { dataset: {} } })).resolves.toBeUndefined();
    await expect(pageInstance.onRunNow({ currentTarget: { dataset: {} } })).resolves.toBeUndefined();

    expect(showErrorMock).toHaveBeenCalled();
    expect(pauseTaskMock).not.toHaveBeenCalled();
    expect(resumeTaskMock).not.toHaveBeenCalled();
    expect(wxMock.showModal).not.toHaveBeenCalled();
  });

  test('pause dataset string false is treated as pause action', async () => {
    await pageInstance.loadTasks();

    await pageInstance.onTogglePause({
      currentTarget: {
        dataset: {
          taskId: 'send_daily_work_log_summary',
          isPaused: 'false',
          index: 0
        }
      }
    });

    expect(pauseTaskMock).toHaveBeenCalledWith('send_daily_work_log_summary');
    expect(resumeTaskMock).not.toHaveBeenCalled();
  });
});
