/**
 * Crypto-JS Polyfill for wept environment
 * 
 * 轻量级的 HMAC-SHA256 实现，用于在 wept 环境下替代 crypto-js
 * 仅实现了 signature.js 所需的 HmacSHA256 功能
 */

/**
 * SHA256 哈希算法实现
 */
function sha256(message) {
  // SHA256 初始哈希值
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // SHA256 常量
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // 将消息转换为字节数组
  const msgBytes = stringToBytes(message);
  const msgLength = msgBytes.length;
  const bitLength = msgLength * 8;

  // 填充消息
  const paddedMsg = msgBytes.slice();
  paddedMsg.push(0x80);
  
  // 填充0直到长度 ≡ 448 (mod 512)
  while ((paddedMsg.length * 8) % 512 !== 448) {
    paddedMsg.push(0x00);
  }

  // 添加原始消息长度（64位大端序）
  for (let i = 7; i >= 0; i--) {
    paddedMsg.push((bitLength >>> (i * 8)) & 0xff);
  }

  // 处理每个512位块
  const blocks = paddedMsg.length / 64;
  let hash = H.slice();

  for (let block = 0; block < blocks; block++) {
    const offset = block * 64;
    const W = new Array(64);

    // 准备消息调度数组
    for (let i = 0; i < 16; i++) {
      W[i] = (paddedMsg[offset + i * 4] << 24) |
             (paddedMsg[offset + i * 4 + 1] << 16) |
             (paddedMsg[offset + i * 4 + 2] << 8) |
             (paddedMsg[offset + i * 4 + 3]);
    }

    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }

    // 初始化工作变量
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    // 主循环
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    // 更新哈希值
    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  // 转换为十六进制字符串
  return hash.map(h => {
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }).join('');
}

/**
 * HMAC-SHA256 实现
 */
function hmacSHA256(message, key) {
  const blockSize = 64; // SHA256 block size in bytes
  
  // 将密钥转换为字节数组
  let keyBytes = stringToBytes(key);
  
  // 如果密钥长度大于块大小，先进行哈希
  if (keyBytes.length > blockSize) {
    keyBytes = hexToBytes(sha256(bytesToString(keyBytes)));
  }
  
  // 填充密钥到块大小
  while (keyBytes.length < blockSize) {
    keyBytes.push(0x00);
  }
  
  // 创建内部和外部填充
  const ipad = new Array(blockSize);
  const opad = new Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyBytes[i] ^ 0x36;
    opad[i] = keyBytes[i] ^ 0x5c;
  }
  
  // 计算内部哈希
  const innerHash = sha256(
    bytesToString(ipad) + message
  );
  
  // 计算外部哈希
  const outerHash = sha256(
    bytesToString(opad) + hexToString(innerHash)
  );
  
  return outerHash;
}

/**
 * 工具函数：右旋转
 */
function rotr(value, bits) {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

/**
 * 工具函数：字符串转字节数组
 */
function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

/**
 * 工具函数：字节数组转字符串
 */
function bytesToString(bytes) {
  return bytes.map(b => String.fromCharCode(b)).join('');
}

/**
 * 工具函数：十六进制转字节数组
 */
function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

/**
 * 工具函数：十六进制字符串转普通字符串
 */
function hexToString(hex) {
  return bytesToString(hexToBytes(hex));
}

/**
 * 导出 Crypto-JS 兼容接口
 */
const CryptoJS = {
  HmacSHA256: function(message, key) {
    return {
      toString: function() {
        return hmacSHA256(message, key);
      }
    };
  },
  
  // 添加其他可能需要的方法（占位）
  SHA256: function(message) {
    return {
      toString: function() {
        return sha256(message);
      }
    };
  }
};

module.exports = CryptoJS;

