const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = __dirname;
const SIZE = 96;
const BORDER = '#5E4E3E';
const FILL_LIGHT = '#FFEBCC';
const FILL_ORANGE = '#FF9F43';

// CartoonIconWrapper: shadow layer (translate 2,2 opacity 0.3) + main layer
function wrap(innerSvg) {
  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(2,2)" opacity="0.3">${innerSvg}</g>
  <g>${innerSvg}</g>
</svg>`;
}

const icons = {
  'sun': wrap(`
    <circle cx="12" cy="12" r="5" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'bell': wrap(`
    <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 14 3 17 3 17H21C21 17 18 14 18 8Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M10.3 21C10.7 21.6 11.3 22 12 22C12.7 22 13.3 21.6 13.7 21" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'clock': wrap(`
    <circle cx="12" cy="12" r="9" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M12 6V12L16 14" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'history': wrap(`
    <circle cx="12" cy="12" r="9" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M12 6V12L16 14" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'briefcase': wrap(`
    <rect x="2" y="7" width="20" height="14" rx="2" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M16 21V5C16 4 15 3 14 3H10C9 3 8 4 8 5V21" stroke="${BORDER}" stroke-width="2"/>
  `),

  'map-pin': wrap(`
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="3" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'plane': wrap(`
    <path d="M17.8 19.2L16 11L19.5 7.5C20.3 6.7 20.3 5.3 19.5 4.5C18.7 3.7 17.3 3.7 16.5 4.5L13 8L4.8 6.2L3.4 7.6L10.5 11.5L7 15L4.2 14.3L2.8 15.7L6.3 17.7L8.3 21.2L9.7 19.8L9 17L12.5 13.5L16.4 20.6L17.8 19.2Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'coffee': wrap(`
    <path d="M18 8H20C21.1 8 22 8.9 22 10V11C22 12.1 21.1 13 20 13H18M2 8H18V17C18 19.2 16.2 21 14 21H6C3.8 21 2 19.2 2 17V8Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M6 1V4M10 1V4M14 1V4" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'clipboard': wrap(`
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'home': wrap(`
    <path d="M3 10.5L12 3L21 10.5V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67157 21 3 20.3284 3 19.5V10.5Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 21V12H15V21" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'settings': wrap(`
    <circle cx="12" cy="12" r="3" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'trending-up': wrap(`
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18M17 6H23V12" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'dollar': wrap(`
    <path d="M12 1V23M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round"/>
  `),

  'search': wrap(`
    <circle cx="11" cy="11" r="8" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M21 21L16.65 16.65" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round"/>
  `),

  'bar-chart': wrap(`
    <path d="M3 3V21H21M18 17V9M13 17V5M8 17V12" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round"/>
  `),

  'shield': wrap(`
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'alert-triangle': wrap(`
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 9V13M12 17H12.01" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'link': wrap(`
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'lock': wrap(`
    <rect x="5" y="11" width="14" height="10" rx="2" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'eye': wrap(`
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <circle cx="12" cy="12" r="3" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'eye-off': wrap(`
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1 1L23 23" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  // 勾选图标（日期选中badge用）
  'check': wrap(`
    <path d="M20 6L9 17L4 12" stroke="${BORDER}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // 日历格子状态图标
  'check-circle': wrap(`
    <circle cx="12" cy="12" r="9" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M8 12L11 15L16 9" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'alert-circle': wrap(`
    <circle cx="12" cy="12" r="9" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M12 8V12M12 16H12.01" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round"/>
  `),

  // 个人中心菜单图标
  'users': wrap(`
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9" cy="7" r="4" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'megaphone': wrap(`
    <path d="M18 15L21 18M18 5L21 2M11.6 3L3 12L11.6 21C11.6 21 16 18 16 12C16 6 11.6 3 11.6 3Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'cloud-sun': wrap(`
    <circle cx="15" cy="9" r="4" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M15 3V1M15 17V15M21 9H23M7 9H9M19.24 4.76L20.66 3.34M9.34 14.66L10.76 13.24M19.24 13.24L20.66 14.66" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
    <path d="M9 17H7a4 4 0 0 1 0-8 5 5 0 0 1 9.9-1" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'filter': wrap(`
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'chevron-left': wrap(`
    <path d="M15 18L9 12L15 6" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'download': wrap(`
    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 10L12 15L17 10" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15V3" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'log-out': wrap(`
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="16 17 21 12 16 7" fill="none" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  'person': wrap(`
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'warning': wrap(`
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#FFB3BA" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 9V13M12 17H12.01" stroke="#F44336" stroke-width="2.5" stroke-linecap="round"/>
  `),

  'zap': wrap(`
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // 考勤/历史�操作按钮图标
  'edit': wrap(`
    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
  `),

  'trash': wrap(`
    <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 3 16 4 16 6" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  'close': wrap(`
    <path d="M18 6L6 18M6 6L18 18" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // 日历图标（考勤历史筛选用）
  'calendar': wrap(`
    <rect x="3" y="4" width="18" height="17" rx="2" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M3 9H21" stroke="${BORDER}" stroke-width="2"/>
    <path d="M8 2V6" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 2V6" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),

  // Sparkles 图�(闪光效果)
  'sparkles': wrap(`
    <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 3L19.5 5L21.5 5.5L19.5 6L19 8L18.5 6L16.5 5.5L18.5 5L19 3Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 17L5.5 19L7.5 19.5L5.5 20L5 22L4.5 20L2.5 19.5L4.5 19L5 17Z" fill="${FILL_ORANGE}" stroke="${BORDER}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // Activity 图�(电表/活动监测)
  'activity': wrap(`
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="${BORDER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  `),

  // CPU 图�(芯片/电表)
  'cpu': wrap(`
    <rect x="4" y="4" width="16" height="16" rx="2" fill="${FILL_LIGHT}" stroke="${BORDER}" stroke-width="2"/>
    <path d="M9 9H15V15H9V9Z" stroke="${BORDER}" stroke-width="2"/>
    <path d="M9 1V4M15 1V4M9 20V23M15 20V23M20 9H23M20 15H23M1 9H4M1 15H4" stroke="${BORDER}" stroke-width="2" stroke-linecap="round"/>
  `),
};

async function generate() {
  for (const [name, svg] of Object.entries(icons)) {
    const outPath = path.join(OUT, name + '.png');
    await sharp(Buffer.from(svg))
      .resize(SIZE, SIZE)
      .png()
      .toFile(outPath);
    console.log('Generated:', name + '.png');
  }
  console.log('All done!');
}

generate().catch(console.error);
