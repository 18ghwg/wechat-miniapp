const {
  normalizeMiniProgramUserInfo,
  normalizeAuthResponse,
  normalizeUserInfoResponse,
  isAdminFeatureKey
} = require('../utils/mini-program-role');

describe('mini program ordinary-user presentation', () => {
  const adminUser = {
    id: 24,
    nickname: 'lelege',
    real_name: '孙乐',
    is_admin: true,
    user_level: 'admin',
    web_user_level: 'admin',
    is_web_bound: true,
    permissions: [
      { code: 'admin', name: '管理员权限', is_granted: true },
      { code: 'attendance', name: '考勤管理', is_granted: true }
    ]
  };

  test('presents an administrator as an ordinary mini-program user', () => {
    const normalized = normalizeMiniProgramUserInfo(adminUser);

    expect(normalized).not.toBe(adminUser);
    expect(normalized).toMatchObject({
      id: 24,
      nickname: 'lelege',
      real_name: '孙乐',
      is_admin: false,
      user_level: 'user',
      web_user_level: 'user',
      is_web_bound: true
    });
    expect(normalized.permissions).toEqual([
      { code: 'attendance', name: '考勤管理', is_granted: true }
    ]);
  });

  test('normalizes login and user-info responses without changing the source', () => {
    const loginResponse = { code: 200, data: { openid: 'wx-user', userInfo: adminUser } };
    const userInfoResponse = { code: 200, data: adminUser };

    expect(normalizeAuthResponse(loginResponse).data.userInfo.is_admin).toBe(false);
    expect(normalizeUserInfoResponse(userInfoResponse).data.is_admin).toBe(false);
    expect(adminUser.is_admin).toBe(true);
  });

  test('filters administrator features from frequent-entry shortcuts', () => {
    expect(isAdminFeatureKey('user-management')).toBe(true);
    expect(isAdminFeatureKey('electric-account')).toBe(true);
    expect(isAdminFeatureKey('admin_create_user')).toBe(true);
    expect(isAdminFeatureKey('attendance')).toBe(false);
  });

  test('keeps administrator-only controls disabled in user-facing templates', () => {
    const fs = require('fs');
    const templates = [
      'pages/usercenter/index.wxml',
      'pages/electric/index.wxml',
      'pages/feedback/index.wxml',
      'pages/work-log/index.wxml',
      'pages/attendance/salary-records/index.wxml',
      'pages/attendance/netdisk/index.wxml'
    ];

    templates.forEach(file => {
      const source = fs.readFileSync(require('path').join(__dirname, '..', file), 'utf8');
      expect(source).not.toMatch(/wx:if="\{\{isAdmin(?:\s|\}|&&)/);
      expect(source).not.toMatch(/wx:if="\{\{canSendSummary(?:\s|\}|&&)/);
    });
  });
});
