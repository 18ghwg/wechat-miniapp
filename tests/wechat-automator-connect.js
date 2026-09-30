const http = require('http');
const automator = require('miniprogram-automator');

function requestAutomation(projectPath, idePort, automatorPort) {
  const query = new URLSearchParams({
    project: projectPath,
    autoPort: String(automatorPort),
  });

  return new Promise((resolve, reject) => {
    const request = http.get(
      `http://127.0.0.1:${idePort}/v2/auto?${query.toString()}`,
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode !== 200) {
            reject(new Error(`DevTools automation request failed: HTTP ${response.statusCode} ${body}`));
            return;
          }
          resolve(JSON.parse(body));
        });
      },
    );
    request.on('error', reject);
  });
}

async function connectWechatAutomator(projectPath) {
  const idePort = Number(process.env.WECHAT_IDE_PORT || 9420);
  const automatorPort = Number(process.env.WECHAT_AUTOMATOR_PORT || 9430);
  const result = await requestAutomation(projectPath, idePort, automatorPort);
  const endpointPort = Number(result.autoPort || automatorPort);
  return automator.connect({ wsEndpoint: `ws://127.0.0.1:${endpointPort}` });
}

module.exports = { connectWechatAutomator };
