/**
 * 地区数据迁移脚本
 * 
 * 功能：将 config/index.js 中的 areaData 提取到独立的 area-data.js 文件
 * 
 * 使用方法：
 * node config/migrate-area-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始迁移地区数据...\n');

// 文件路径
const indexPath = path.join(__dirname, 'index.js');
const areaDataPath = path.join(__dirname, 'area-data.js');
const indexBackupPath = path.join(__dirname, 'index.js.backup');

try {
  // 1. 备份原文件
  console.log('📦 备份原文件...');
  fs.copyFileSync(indexPath, indexBackupPath);
  console.log(`✅ 已备份到: ${indexBackupPath}\n`);

  // 2. 读取 index.js
  console.log('📖 读取 config/index.js...');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // 3. 提取 areaData（从 "export const areaData" 到文件结束）
  console.log('🔍 提取地区数据...');
  const areaDataMatch = indexContent.match(/export const areaData = \[[\s\S]*\];/);
  
  if (!areaDataMatch) {
    throw new Error('未找到 areaData 定义');
  }

  const areaDataCode = areaDataMatch[0];
  console.log(`✅ 提取到 ${areaDataCode.split('\n').length} 行地区数据\n`);

  // 4. 创建新的 area-data.js 内容
  console.log('✍️  生成 area-data.js...');
  const areaDataFileContent = `/**
 * 地区数据（独立文件）
 * 从 config/index.js 迁移而来
 * 仅在需要时加载（如电费查询页面、地址选择等）
 * 
 * 使用方式：
 * import { areaData } from '../../config/area-data';
 */

${areaDataCode}
`;

  // 5. 写入 area-data.js
  fs.writeFileSync(areaDataPath, areaDataFileContent, 'utf-8');
  console.log(`✅ 已创建: ${areaDataPath}\n`);

  // 6. 修改 index.js，移除 areaData 定义，改为导入
  console.log('🔧 更新 config/index.js...');
  const newIndexContent = indexContent.replace(
    /export const areaData = \[[\s\S]*\];/,
    `// 地区数据已迁移到独立文件
// 导入地区数据
import { areaData } from './area-data';

// 重新导出地区数据（保持兼容性）
export { areaData };`
  );

  // 7. 写回 index.js
  fs.writeFileSync(indexPath, newIndexContent, 'utf-8');
  console.log(`✅ 已更新 config/index.js\n`);

  // 8. 验证文件大小
  const oldSize = fs.statSync(indexBackupPath).size;
  const newSize = fs.statSync(indexPath).size;
  const areaDataSize = fs.statSync(areaDataPath).size;
  
  console.log('📊 文件大小对比:');
  console.log(`   原 index.js:     ${(oldSize / 1024).toFixed(2)} KB`);
  console.log(`   新 index.js:     ${(newSize / 1024).toFixed(2)} KB`);
  console.log(`   新 area-data.js: ${(areaDataSize / 1024).toFixed(2)} KB`);
  console.log(`   减少大小:        ${((oldSize - newSize) / 1024).toFixed(2)} KB\n`);

  console.log('✅ 迁移完成！\n');
  console.log('📝 后续步骤:');
  console.log('   1. 检查 config/index.js 和 config/area-data.js');
  console.log('   2. 测试所有使用地区数据的页面');
  console.log('   3. 确认无误后删除备份文件: config/index.js.backup');
  console.log('');

} catch (error) {
  console.error('❌ 迁移失败:', error.message);
  console.error('\n如果出现问题，请从备份恢复:');
  console.error(`   cp config/index.js.backup config/index.js`);
  process.exit(1);
}

