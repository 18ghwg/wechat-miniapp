const fs = require('fs');
const path = require('path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

describe('legacy salary calculation entry removal', () => {
  test('removes the legacy salary editor from attendance history', () => {
    const template = read('pages/attendance/history/index.wxml');

    expect(template).not.toContain('bindtap="onOpenSalarySheet"');
    expect(template).not.toContain('点击预览并编辑当月工资内容');
    expect(template).not.toContain('wx:if="{{showSalaryModal}}"');
    expect(template).not.toContain('保 存 工 资 条');
  });

  test('removes the legacy salary settings menu from user center', () => {
    const source = read('pages/usercenter/index.js');

    expect(source).not.toContain("label: '工资条设置'");
    expect(source).not.toContain("case 'salaryConfig'");
    expect(source).toContain("label: '考勤与工资规则'");
  });
});
