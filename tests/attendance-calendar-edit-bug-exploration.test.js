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

const automator = require('miniprogram-automator');
const path = require('path');

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
    miniProgram = await automator.launch({
      projectPath: path.join(__dirname, '..'),
      cliPath: 'cli', // 微信开发者工具 cli 路径，根据实际情况调整
    });

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
   * 测试场景1: 快速返回测试
   * 
   * 用户在10秒内完成编辑并返回，验证日历未更新（预期失败）
   * 
   * 验证条件:
   * - _needRefreshCalendar 为 true
   * - 从编辑页面返回（fromPage == 'attendance/submit/index'）
   * - 距上次刷新时间 < 30秒
   * - 日历显示状态未更新
   */
  test('场景1: 快速返回测试 - 10秒内编辑并返回', async () => {
    console.log('🧪 开始测试场景1: 快速返回测试');

    // 1. 记录初始状态
    const initialCalendarData = await page.data('calendarDays');
    const initialAttendanceMap = await page.data('attendanceMap');
    console.log('📊 初始日历数据:', {
      calendarDaysCount: initialCalendarData.length,
      attendanceMapKeys: Object.keys(initialAttendanceMap).length
    });

    // 2. 选择一个未打卡的日期（或已打卡的日期）
    const testDate = '2025-01-15'; // 使用一个测试日期
    console.log(`📅 选择测试日期: ${testDate}`);

    // 3. 模拟点击日期，跳转到编辑页面
    // 注意: 这里会设置 _needRefreshCalendar = true
    const calendarDay = await page.$$(`.calendar-day[data-date="${testDate}"]`);
    if (calendarDay.length > 0) {
      await calendarDay[0].tap();
      await page.waitFor(1000);
    } else {
      console.warn('⚠️ 未找到测试日期元素，使用导航方式');
      await miniProgram.navigateTo(`/pages/attendance/submit/index?date=${testDate}`);
      await page.waitFor(1000);
    }

    // 4. 在编辑页面进行操作（模拟快速编辑）
    const submitPage = await miniProgram.currentPage();
    console.log('📝 当前页面路径:', submitPage.path);

    // 模拟选择工作状态
    const workStatusPicker = await submitPage.$('.work-status-picker');
    if (workStatusPicker) {
      await workStatusPicker.tap();
      await submitPage.waitFor(500);
      
      // 选择"公司上班"
      const companyWorkOption = await submitPage.$$('.picker-item[data-value="公司上班"]');
      if (companyWorkOption.length > 0) {
        await companyWorkOption[0].tap();
        await submitPage.waitFor(500);
      }
    }

    // 5. 快速返回（10秒内）- 不提交，直接返回
    console.log('⏱️ 快速返回（10秒内）');
    await miniProgram.navigateBack();
    await page.waitFor(1000);

    // 6. 验证日历是否更新
    const updatedCalendarData = await page.data('calendarDays');
    const updatedAttendanceMap = await page.data('attendanceMap');
    const needRefreshFlag = await page.data('_needRefreshCalendar');

    console.log('📊 返回后日历数据:', {
      calendarDaysCount: updatedCalendarData.length,
      attendanceMapKeys: Object.keys(updatedAttendanceMap).length,
      needRefreshFlag: needRefreshFlag
    });

    // 7. 断言: 在未修复的代码上，这个测试应该失败
    // 因为日历没有更新，attendanceMap 应该与初始状态相同
    const attendanceUpdated = JSON.stringify(initialAttendanceMap) !== JSON.stringify(updatedAttendanceMap);

    console.log('🔍 验证结果:');
    console.log(`  - 日历是否更新: ${attendanceUpdated ? '是' : '否'}`);
    console.log(`  - _needRefreshCalendar 标记: ${needRefreshFlag}`);

    // **预期结果**: 在未修复的代码上，此断言应该失败
    // 因为日历没有更新（attendanceUpdated 为 false）
    expect(attendanceUpdated).toBe(true); // 期望日历已更新，但实际未更新
    
    console.log('❌ 测试失败（预期）: 日历未更新，bug存在');
  }, 30000); // 30秒超时

  /**
   * 测试场景2: 30秒内返回测试
   * 
   * 用户在25秒内完成编辑并返回，验证被时间检查拦截（预期失败）
   */
  test('场景2: 30秒内返回测试 - 25秒内编辑并返回', async () => {
    console.log('🧪 开始测试场景2: 30秒内返回测试');

    // 1. 先触发一次刷新，记录刷新时间
    await page.callMethod('refreshPageData');
    await page.waitFor(2000);
    console.log('🔄 触发初始刷新，记录刷新时间');

    // 2. 记录初始状态
    const initialAttendanceMap = await page.data('attendanceMap');
    const testDate = '2025-01-16';

    // 3. 跳转到编辑页面
    await miniProgram.navigateTo(`/pages/attendance/submit/index?date=${testDate}`);
    await page.waitFor(1000);

    // 4. 等待20秒（模拟用户编辑时间，但仍在30秒内）
    console.log('⏱️ 等待20秒（模拟编辑时间）');
    await page.waitFor(20000);

    // 5. 返回日历页面
    console.log('⏱️ 返回日历页面（距上次刷新约22秒）');
    await miniProgram.navigateBack();
    await page.waitFor(1000);

    // 6. 验证日历是否更新
    const updatedAttendanceMap = await page.data('attendanceMap');
    const attendanceUpdated = JSON.stringify(initialAttendanceMap) !== JSON.stringify(updatedAttendanceMap);

    console.log('🔍 验证结果:');
    console.log(`  - 日历是否更新: ${attendanceUpdated ? '是' : '否'}`);
    console.log(`  - 距上次刷新时间: 约22秒（< 30秒）`);

    // **预期结果**: 在未修复的代码上，此断言应该失败
    // 因为被30秒时间检查拦截，日历没有更新
    expect(attendanceUpdated).toBe(true);
    
    console.log('❌ 测试失败（预期）: 被时间检查拦截，日历未更新');
  }, 60000); // 60秒超时

  /**
   * 测试场景3: 连续编辑测试
   * 
   * 用户连续编辑3个日期，每次间隔5秒，验证第2、3次编辑后日历未更新（预期失败）
   */
  test('场景3: 连续编辑测试 - 连续编辑3个日期', async () => {
    console.log('🧪 开始测试场景3: 连续编辑测试');

    const testDates = ['2025-01-17', '2025-01-18', '2025-01-19'];
    const results = [];

    for (let i = 0; i < testDates.length; i++) {
      const testDate = testDates[i];
      console.log(`\n📅 编辑第 ${i + 1} 个日期: ${testDate}`);

      // 记录编辑前的状态
      const beforeAttendanceMap = await page.data('attendanceMap');

      // 跳转到编辑页面
      await miniProgram.navigateTo(`/pages/attendance/submit/index?date=${testDate}`);
      await page.waitFor(1000);

      // 快速返回（5秒内）
      console.log('⏱️ 快速返回（5秒内）');
      await miniProgram.navigateBack();
      await page.waitFor(1000);

      // 验证日历是否更新
      const afterAttendanceMap = await page.data('attendanceMap');
      const updated = JSON.stringify(beforeAttendanceMap) !== JSON.stringify(afterAttendanceMap);

      results.push({
        date: testDate,
        iteration: i + 1,
        updated: updated
      });

      console.log(`  - 第 ${i + 1} 次编辑后日历是否更新: ${updated ? '是' : '否'}`);

      // 等待5秒再进行下一次编辑
      if (i < testDates.length - 1) {
        await page.waitFor(5000);
      }
    }

    // 验证结果
    console.log('\n🔍 连续编辑测试结果:');
    results.forEach(result => {
      console.log(`  - 第 ${result.iteration} 次 (${result.date}): ${result.updated ? '已更新' : '未更新'}`);
    });

    // **预期结果**: 在未修复的代码上，第2、3次编辑应该失败
    // 因为距上次刷新时间 < 30秒，被时间检查拦截
    const allUpdated = results.every(r => r.updated);
    expect(allUpdated).toBe(true);
    
    console.log('❌ 测试失败（预期）: 第2、3次编辑后日历未更新');
  }, 90000); // 90秒超时

  /**
   * 测试场景4: 未打卡到已打卡测试
   * 
   * 从未打卡日期（感叹号）编辑为"公司上班"后返回，验证感叹号仍存在（预期失败）
   */
  test('场景4: 未打卡到已打卡测试 - 感叹号应消失', async () => {
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

    // 3. 跳转到编辑页面
    await miniProgram.navigateTo(`/pages/attendance/submit/index?date=${testDate}`);
    await page.waitFor(1000);

    const submitPage = await miniProgram.currentPage();

    // 4. 选择"公司上班"并提交（在测试模式下）
    // 注意: 这里需要确保在测试模式下运行
    const submitButton = await submitPage.$('.submit-button');
    if (submitButton) {
      await submitButton.tap();
      await submitPage.waitFor(2000); // 等待提交完成
    }

    // 5. 返回日历页面
    console.log('⏱️ 返回日历页面');
    await miniProgram.navigateBack();
    await page.waitFor(1000);

    // 6. 验证日历是否更新 - 感叹号应该消失
    const updatedCalendarDays = await page.data('calendarDays');
    const updatedDayInfo = updatedCalendarDays.find(day => day.date === testDate);
    console.log('📊 更新后日期状态:', updatedDayInfo);

    const missedStatusCleared = initialDayInfo?.isMissed === true && updatedDayInfo?.isMissed === false;
    const hasAttendance = updatedDayInfo?.hasAttendance === true;

    console.log('🔍 验证结果:');
    console.log(`  - 初始状态: isMissed=${initialDayInfo?.isMissed}, hasAttendance=${initialDayInfo?.hasAttendance}`);
    console.log(`  - 更新后状态: isMissed=${updatedDayInfo?.isMissed}, hasAttendance=${updatedDayInfo?.hasAttendance}`);
    console.log(`  - 感叹号是否消失: ${missedStatusCleared ? '是' : '否'}`);
    console.log(`  - 是否有考勤记录: ${hasAttendance ? '是' : '否'}`);

    // **预期结果**: 在未修复的代码上，此断言应该失败
    // 因为日历没有更新，感叹号仍然存在
    expect(missedStatusCleared).toBe(true);
    expect(hasAttendance).toBe(true);
    
    console.log('❌ 测试失败（预期）: 感叹号仍存在，日历未更新');
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
