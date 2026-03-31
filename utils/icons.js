/**
 * 图标工具 - 完全复刻 Icons.tsx CartoonIconWrapper 双层阴影风格
 */
const B = '#5E4E3E';
const P = '#FF9F43';
const S = '#FFEBCC';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function _btoa(str) {
  var r = '', i = 0;
  while (i < str.length) {
    var a = str.charCodeAt(i++);
    var b = i < str.length ? str.charCodeAt(i++) : 0;
    var c = i < str.length ? str.charCodeAt(i++) : 0;
    r += B64[a >> 2];
    r += B64[((a & 3) << 4) | (b >> 4)];
    r += i - 2 < str.length ? B64[((b & 15) << 2) | (c >> 6)] : '=';
    r += i - 1 < str.length ? B64[c & 63] : '=';
  }
  return r;
}

function icon(inner) {
  var s = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<g transform="translate(2,2)" opacity="0.3">' + inner + '</g>'
    + '<g>' + inner + '</g>'
    + '</svg>';
  return 'data:image/svg+xml;base64,' + _btoa(unescape(encodeURIComponent(s)));
}

var icons = {
  calendar: icon(
    '<rect x="3" y="4" width="18" height="17" rx="2" fill="' + S + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M3 9H21" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M8 2V6" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M16 2V6" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
  ),
  zap: icon(
    '<path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" fill="' + P + '" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  user: icon(
    '<path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="' + S + '" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" fill="' + S + '" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  bell: icon(
    '<path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 14 3 17 3 17H21C21 17 18 14 18 8Z" fill="' + P + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M10.3 21C10.7 21.6 11.3 22 12 22C12.7 22 13.3 21.6 13.7 21" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
  ),
  sun: icon(
    '<circle cx="12" cy="12" r="5" fill="' + P + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
  ),
  clock: icon(
    '<circle cx="12" cy="12" r="9" fill="' + S + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M12 6V12L16 14" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  home: icon(
    '<path d="M3 10.5L12 3L21 10.5V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67157 21 3 20.3284 3 19.5V10.5Z" fill="' + S + '" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M9 21V12H15V21" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  briefcase: icon(
    '<rect x="2" y="7" width="20" height="14" rx="2" fill="' + S + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M16 21V5C16 4 15 3 14 3H10C9 3 8 4 8 5V21" stroke="' + B + '" stroke-width="2"/>'
  ),
  mapPin: icon(
    '<path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="' + P + '" stroke="' + B + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<circle cx="12" cy="10" r="3" fill="' + S + '" stroke="' + B + '" stroke-width="2"/>'
  ),
  plane: icon(
    '<path d="M17.8 19.2L16 11L19.5 7.5C20.3 6.7 20.3 5.3 19.5 4.5C18.7 3.7 17.3 3.7 16.5 4.5L13 8L4.8 6.2L3.4 7.6L10.5 11.5L7 15L4.2 14.3L2.8 15.7L6.3 17.7L8.3 21.2L9.7 19.8L9 17L12.5 13.5L16.4 20.6L17.8 19.2Z" fill="' + P + '" stroke="' + B + '" stroke-width="2"/>'
  ),
  coffee: icon(
    '<path d="M18 8H20C21.1 8 22 8.9 22 10V11C22 12.1 21.1 13 20 13H18M2 8H18V17C18 19.2 16.2 21 14 21H6C3.8 21 2 19.2 2 17V8Z" fill="' + S + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M6 1V4M10 1V4M14 1V4" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
  ),
  alertCircle: icon(
    '<circle cx="12" cy="12" r="9" fill="' + P + '" stroke="' + B + '" stroke-width="2"/>'
    + '<path d="M12 8V12M12 16H12.01" stroke="' + B + '" stroke-width="2" stroke-linecap="round"/>'
  ),
  check: icon(
    '<path d="M20 6L9 17L4 12" stroke="' + B + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
  ),
  barChart: icon(
    '<path d="M3 3V21H21M18 17V9M13 17V5M8 17V12" stroke="' + B + '" stroke-width="2.5" stroke-linecap="round"/>'
  ),
};

module.exports = icons;