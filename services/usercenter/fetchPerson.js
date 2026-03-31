// 使用轻量级配置（不包含地区数据，提升性能）
import { config } from '../../config/config-lite';

/** 获取个人中心信息 */
function mockFetchPerson() {
  const { delay } = require('../_utils/delay');
  const { genSimpleUserInfo } = require('../../model/usercenter');
  return delay().then(() => (genSimpleUserInfo()));
}

/** 获取个人中心信息 */
export function fetchPerson() {
  if (config.useMock) {
    return mockFetchPerson();
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}
