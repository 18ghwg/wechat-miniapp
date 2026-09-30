const path = require('path');
const fs = require('fs');
const ci = require('miniprogram-ci');

function parseVersion(version) {
  const parts = String(version || '0.0.0').trim().split('.').map((x) => parseInt(x, 10));
  while (parts.length < 3) parts.push(0);
  if (parts.some(Number.isNaN)) return [1, 0, 0];
  return parts.slice(0, 3);
}

function bumpPatch(version) {
  const parts = parseVersion(version);
  parts[2] += 1;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function resolveLocalVersion(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return '1.0.0';
  const pkg = readJson(packageJsonPath);
  return pkg.version || '1.0.0';
}

async function main() {
  const projectPath = process.env.WX_MINIPROGRAM_PROJECT_PATH;
  const appid = process.env.WX_MINIPROGRAM_APPID;
  const privateKeyPath = process.env.WX_MINIPROGRAM_PRIVATE_KEY_PATH;
  const desc = process.env.WX_MINIPROGRAM_UPLOAD_DESC || '';

  if (!projectPath || !appid || !privateKeyPath) {
    throw new Error('缺少必要环境变量：WX_MINIPROGRAM_PROJECT_PATH / WX_MINIPROGRAM_APPID / WX_MINIPROGRAM_PRIVATE_KEY_PATH');
  }
  if (!fs.existsSync(projectPath)) throw new Error(`项目目录不存在: ${projectPath}`);
  if (!fs.existsSync(path.join(projectPath, 'project.config.json'))) throw new Error('缺少 project.config.json');
  if (!fs.existsSync(privateKeyPath)) throw new Error(`私钥不存在: ${privateKeyPath}`);

  const localVersion = resolveLocalVersion(projectPath);
  const version = process.env.WX_MINIPROGRAM_UPLOAD_VERSION || bumpPatch(localVersion);

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    // Credentials and local runtime state must never enter the Mini Program package.
    ignores: [
      'node_modules/**/*',
      '**/*.key',
      '**/*.pem',
      '.env*',
      '**/.env*',
      'backups/**/*',
      '**/backups/**/*',
    ],
  });

  console.log(JSON.stringify({
    action: 'upload-start',
    projectPath,
    appid,
    localVersion,
    version,
    desc,
  }, null, 2));

  const result = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      minifyJS: true,
      minifyWXML: true,
      minifyWXSS: true,
      minify: true,
      autoPrefixWXSS: true,
      uploadWithSourceMap: false,
    },
    onProgressUpdate: console.log,
  });

  console.log(JSON.stringify({ action: 'upload-done', localVersion, version, result }, null, 2));
}

main().catch((err) => {
  console.error('[wx-upload-error]', err && err.stack ? err.stack : err);
  process.exit(1);
});
