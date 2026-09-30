const ADMIN_FEATURE_KEYS = new Set([
  'notification-group',
  'df-notification',
  'electric-account',
  'user-management',
  'announcement',
  'task-management',
  'usage-records',
  'env-config',
  'weather-settings'
]);

function permissionCode(permission) {
  if (typeof permission === 'string') {
    return permission;
  }
  if (!permission || typeof permission !== 'object') {
    return '';
  }
  return permission.code || permission.permission_code || '';
}

function normalizeMiniProgramUserInfo(userInfo) {
  if (!userInfo || typeof userInfo !== 'object') {
    return userInfo;
  }

  const normalized = Object.assign({}, userInfo, {
    is_admin: false,
    user_level: 'user'
  });

  if (Object.prototype.hasOwnProperty.call(normalized, 'web_user_level')) {
    normalized.web_user_level = 'user';
  }

  normalized.permissions = Array.isArray(userInfo.permissions)
    ? userInfo.permissions.filter(permission => String(permissionCode(permission)).toLowerCase() !== 'admin')
    : [];

  return normalized;
}

function normalizeAuthResponse(response) {
  if (!response || !response.data || !response.data.userInfo) {
    return response;
  }

  return Object.assign({}, response, {
    data: Object.assign({}, response.data, {
      userInfo: normalizeMiniProgramUserInfo(response.data.userInfo)
    })
  });
}

function normalizeUserInfoResponse(response) {
  if (!response || !response.data) {
    return response;
  }
  return Object.assign({}, response, {
    data: normalizeMiniProgramUserInfo(response.data)
  });
}

function isAdminFeatureKey(featureKey) {
  return ADMIN_FEATURE_KEYS.has(featureKey) || String(featureKey || '').startsWith('admin_');
}

module.exports = {
  normalizeMiniProgramUserInfo,
  normalizeAuthResponse,
  normalizeUserInfoResponse,
  isAdminFeatureKey
};
