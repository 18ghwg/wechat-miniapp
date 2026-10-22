const fs = require('fs');
const path = require('path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

describe('attendance salary entry points', () => {
  test('restores the monthly salary editor and generated-record entry in attendance history', () => {
    const template = read('pages/attendance/history/index.wxml');

    expect(template).toContain('bindtap="onOpenSalarySheet"');
    expect(template).toContain('bindtap="onOpenSalaryRecords"');
    expect(template).toContain('wx:if="{{showSalaryModal}}"');
    expect(template).toContain('bindtap="onSaveSalarySheet"');
  });

  test('removes the legacy salary settings menu from user center', () => {
    const source = read('pages/usercenter/index.js');

    expect(source).not.toContain("label: '工资条设置'");
    expect(source).not.toContain("case 'salaryConfig'");
    expect(source).toContain("label: '考勤与工资规则'");
  });
});
