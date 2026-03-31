/**
 * 完整配置文件
 * 包含API配置和地区数据
 * 
 * 注意：API配置统一从 api-config.js 导入，不要在此文件中重复定义
 */

// 导入全局API配置
import { apiConfig } from './api-config';

// 导出API配置（保持兼容性）
export const config = apiConfig;

// 商城相关的CDN配置已删除

// 地区数据已迁移到独立文件
// 导入地区数据
import { areaData } from './area-data';

// 重新导出地区数据（保持兼容性）
export { areaData };
