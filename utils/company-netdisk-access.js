const COMPANY_NETDISK_VERIFICATION_PREFIX = 'company_netdisk_verified_v1:';

const ALLOWED_COMPANY_NAMES = new Set([
  'LXT',
  '南京力禧特',
  '力禧特',
  '南京力禧特光电科技有限公司'
]);

function normalizeCompanyName(value) {
  return String(value || '').trim().toUpperCase();
}

function isAllowedCompanyName(value) {
  return ALLOWED_COMPANY_NAMES.has(normalizeCompanyName(value));
}

function getCompanyNetdiskVerificationKey(openid, userInfo = {}) {
  const identity = openid
    || userInfo.openid
    || userInfo.id
    || userInfo.web_username
    || '';

  if (!identity) {
    return '';
  }

  return COMPANY_NETDISK_VERIFICATION_PREFIX + encodeURIComponent(String(identity));
}

module.exports = {
  normalizeCompanyName,
  isAllowedCompanyName,
  getCompanyNetdiskVerificationKey
};
