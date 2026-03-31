// 使用轻量级配置（不包含地区数据，提升性能）
import { config } from '../../config/config-lite';

/** 获取个人中心信息 */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

/** 获取个人中心信息 */
export function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter();
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}
