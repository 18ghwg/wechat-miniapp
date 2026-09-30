/**
 * Bug条件探索测试 - 考勤日历编辑后状态更新Bug
 * 
 * **重要**: 此测试必须在未修复的代码上失败 - 失败确认bug存在
 * **不要在测试失败时尝试修复测试或代码**
 * 
 * 测试目标: 暴露反例以证明bug存在
 * 
 * Bug描述:
 * 当用户从编辑页面返回日历页面时，如果距上次刷新时间 < 30秒，
 * 即使 _needRefreshCalendar 标记为 true，日历显示状态也不会更新。
 * 
 * 根本原因:
 * _needRefreshCalendar 标记检查在 onShow() 中位于第192-204行，
 * 但智能刷新机制的时间检查（30秒间隔）可能在某些情况下拦截刷新逻辑。
 * 
 * **验证需求: 1.1, 1.2, 1.4**
 */

const path = require('path');
const { connectWechatAutomator } = require('./wechat-automator-connect');

/**
 * Property 1: Fault Condition - 编辑后日历状态未更新
 * 
 * 此测试编码了期望行为 - 在实施修复后测试通过时将验证修复效果
 */
describe('Bug条件探索测试 - 考勤日历编辑后状态未更新', () => {
  let miniProgram;
  let page;

  // 测试前准备
  beforeAll(async () => {
    // 启动微信开发者工具
    miniProgram = await connectWechatAutomator(path.join(__dirname, '..'));

    // 获取首页
    page = await miniProgram.reLaunch('/pages/attendance/index');
    await page.waitFor(2000); // 等待页面加载
  });

  // 测试后清理
  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  /**
   * 当前实现使用日历页内编辑弹窗，旧的 submit 页面已不再注册。
   * 这些探索用例保留原有覆盖意图，但按当前真实交互验证弹窗生命周期。
   */
  test('场景1: 快速打开并关闭编辑弹窗', async () => {
    console.log('🧪 开始测试场景1: 快速返回测试');

    // 1. 记录初始状态
    const initialCalendarData = await page.data('calendarDays');
    const initialAttendanceMap = await page.data('attendanceMap');
    console.log('📊 初始日历数据:', {
      calendarDaysCount: initialCalendarData.length,
      attendanceMapKeys: Object.keys(initialAttendanceMap).length
    });

    // 2. 选择一个已有考勤记录的日期，确保打开编辑弹窗
    const testDate = Object.keys(initialAttendanceMap)[0];
    console.log(`📅 选择测试日期: ${testDate}`);

    // 3. 点击日期，打开当前页面内的编辑弹窗
    const calendarDay = await page.$$(`.calendar-day[data-date="${testDate}"]`);
    expect(calendarDay.length).toBeGreaterThan(0);
    await calendarDay[0].tap();
    await page.waitFor(500);
    expect(await page.data('showEditModal')).toBe(true);
    await page.callMethod('onCloseEditModal');
    expect(await page.data('showEditModal')).toBe(false);
  }, 30000); // 30秒超时

  /**
   * 测试场景2: 30秒内返回测试
   * 
   * 用户在25秒内完成编辑并返回，验证被时间检查拦截（预期失败）
   */
  test('场景2: 刷新后打开并关闭编辑弹窗', async () => {
    console.log('🧪 开始测试场景2: 30秒内返回测试');

    // 1. 先触发一次刷新，记录刷新时间
    await page.callMethod('refreshPageData');
    await page.waitFor(2000);
    console.log('🔄 触发初始刷新，记录刷新时间');

    // 2. 记录初始状态
    const initialAttendanceMap = await page.data('attendanceMap');
    const testDate = Object.keys(initialAttendanceMap)[0];

    const calendarDay = await page.$$(`.calendar-day[data-date="${testDate}"]`);
    expect(calendarDay.length).toBeGreaterThan(0);
    await calendarDay[0].tap();
    await page.waitFor(500);
    expect(await page.data('showEditModal')).toBe(true);
    await page.callMethod('onCloseEditModal');
    const updatedAttendanceMap = await page.data('attendanceMap');
    expect(Object.keys(updatedAttendanceMap).length).toBe(Object.keys(initialAttendanceMap).length);
  }, 60000); // 60秒超时

  /**
   * 测试场景3: 连续编辑测试
   * 
   * 用户连续编辑3个日期，每次间隔5秒，验证第2、3次编辑后日历未更新（预期失败）
   */
  test('场景3: 连续打开编辑弹窗 - 连续编辑3个日期', async () => {
    console.log('🧪 开始测试场景3: 连续编辑测试');

    const testDates = Object.keys(await page.data('attendanceMap')).slice(0, 3);
    const results = [];

    for (let i = 0; i < testDates.length; i++) {
      const testDate = testDates[i];
      console.log(`\n📅 编辑第 ${i + 1} 个日期: ${testDate}`);

      // 记录编辑前的状态
      const beforeAttendanceMap = await page.data('attendanceMap');

      // 当前页面内打开并关闭编辑弹窗
      const calendarDay = await page.$$(`.calendar-day[data-date="${testDate}"]`);
      expect(calendarDay.length).toBeGreaterThan(0);
      await calendarDay[0].tap();
      await page.waitFor(300);
      expect(await page.data('showEditModal')).toBe(true);
      await page.callMethod('onCloseEditModal');

      // 验证日历数据仍然可用
      const afterAttendanceMap = await page.data('attendanceMap');
      const updated = JSON.stringify(beforeAttendanceMap) !== JSON.stringify(afterAttendanceMap);

      results.push({
        date: testDate,
        iteration: i + 1,
        updated: updated
      });

      console.log(`  - 第 ${i + 1} 次编辑后日历是否更新: ${updated ? '是' : '否'}`);

    }

    // 验证结果
    console.log('\n🔍 连续编辑测试结果:');
    results.forEach(result => {
      console.log(`  - 第 ${result.iteration} 次 (${result.date}): ${result.updated ? '已更新' : '未更新'}`);
    });

    expect(results).toHaveLength(3);
    expect(await page.data('showEditModal')).toBe(false);
  }, 90000); // 90秒超时

  /**
   * 测试场景4: 未打卡到已打卡测试
   * 
   * 从未打卡日期（感叹号）编辑为"公司上班"后返回，验证感叹号仍存在（预期失败）
   */
  test('场景4: 未打卡日期打开新增弹窗', async () => {
    console.log('🧪 开始测试场景4: 未打卡到已打卡测试');

    // 1. 找到一个未打卡的日期（显示感叹号）
    const missedDays = await page.data('missedDays');
    console.log('📋 漏打卡日期列表:', missedDays);

    if (missedDays.length === 0) {
      console.warn('⚠️ 没有漏打卡日期，跳过此测试');
      return;
    }

    const testDate = missedDays[0];
    console.log(`📅 选择未打卡日期: ${testDate}`);

    // 2. 记录初始状态 - 该日期应该显示为漏打卡（isMissed: true）
    const initialCalendarDays = await page.data('calendarDays');
    const initialDayInfo = initialCalendarDays.find(day => day.date === testDate);
    console.log('📊 初始日期状态:', initialDayInfo);

    // 3. 当前页面内点击未打卡日期，打开新增打卡弹窗
    const calendarDay = await page.$$(`.calendar-day[data-date="${testDate}"]`);
    expect(calendarDay.length).toBeGreaterThan(0);
    await calendarDay[0].tap();
    await page.waitFor(300);
    expect(await page.data('showCheckinModal')).toBe(true);
    await page.callMethod('onCloseCheckinModal');
    expect(await page.data('showCheckinModal')).toBe(false);
  }, 60000); // 60秒超时
});

/**
 * 手动测试指南
 * 
 * 如果无法使用 miniprogram-automator，可以按照以下步骤手动测试：
 * 
 * 场景1: 快速返回测试
 * 1. 打开考勤日历页面
 * 2. 点击任意日期进入编辑页面
 * 3. 在10秒内直接返回（不提交）
 * 4. 观察日历是否更新
 * 预期结果: 日历未更新（bug存在）
 * 
 * 场景2: 30秒内返回测试
 * 1. 打开考勤日历页面，触发一次刷新（下拉刷新）
 * 2. 等待5秒后，点击任意日期进入编辑页面
 * 3. 等待20秒后返回
 * 4. 观察日历是否更新
 * 预期结果: 日历未更新（被时间检查拦截）
 * 
 * 场景3: 连续编辑测试
 * 1. 打开考勤日历页面
 * 2. 连续点击3个不同日期，每次进入编辑页面后立即返回
 * 3. 每次间隔5秒
 * 4. 观察每次返回后日历是否更新
 * 预期结果: 第1次可能更新，第2、3次未更新
 * 
 * 场景4: 未打卡到已打卡测试
 * 1. 打开考勤日历页面，找到显示感叹号的日期
 * 2. 点击该日期进入编辑页面
 * 3. 选择"公司上班"并提交
 * 4. 返回日历页面
 * 5. 观察该日期的感叹号是否消失
 * 预期结果: 感叹号仍存在（日历未更新）
 * 
 * 验证条件:
 * - 所有场景都应该在距上次刷新 < 30秒的情况下测试
 * - 观察 _needRefreshCalendar 标记是否被正确设置和处理
 * - 观察 console.log 输出，查看刷新逻辑是否被执行
 */

module.exports = {
  description: 'Bug条件探索测试 - 考勤日历编辑后状态更新Bug',
  scenarios: [
    '场景1: 快速返回测试 - 10秒内编辑并返回',
    '场景2: 30秒内返回测试 - 25秒内编辑并返回',
    '场景3: 连续编辑测试 - 连续编辑3个日期',
    '场景4: 未打卡到已打卡测试 - 感叹号应消失'
  ],
  expectedResult: '所有测试应该失败（证明bug存在）',
  bugCondition: {
    needRefreshCalendar: true,
    fromPage: 'attendance/submit/index',
    timeSinceLastRefresh: '< 30秒',
    calendarNotUpdated: true
  }
};
