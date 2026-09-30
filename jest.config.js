module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 180000, // 3分钟超时，因为测试涉及小程序自动化
  verbose: true,
  collectCoverage: false,
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  // 忽略 node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(miniprogram-automator)/)'
  ]
};
