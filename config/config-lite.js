/**
 * 轻量级配置文件
 * 仅包含API配置，不包含地区数据
 * 用于首页等不需要地区数据的页面，减少首屏加载时间
 * 
 * 注意：API配置统一从 api-config.js 导入，不要在此文件中重复定义
 */

// 导入全局API配置
import { apiConfig } from './api-config';

// 直接导出API配置
export const config = apiConfig;

