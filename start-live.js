const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 5050;
const CLOUDFLARED_PATH = path.join(__dirname, 'cloudflared.exe');
const BACKEND_DIR = path.join(__dirname, 'backend');
const LIVE_URL_FILE = path.join(__dirname, 'LIVE_URL.txt');

let serverProcess = null;
let tunnelProcess = null;
let currentLiveUrl = null;
let isShuttingDown = false;

function log(prefix, msg) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] [${prefix}] ${msg}`);
}

function startBackend() {
  if (isShuttingDown) return;
  log('BACKEND', 'Starting backend server on port ' + PORT + '...');

  serverProcess = spawn('node', ['src/server.js'], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log('BACKEND', text);
  });

  serverProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log('BACKEND-ERR', text);
  });

  serverProcess.on('close', (code) => {
    if (!isShuttingDown) {
      log('BACKEND', `Backend exited with code ${code}. Auto-restarting in 2s...`);
      setTimeout(startBackend, 2000);
    }
  });
}

function waitForBackend(callback) {
  const check = () => {
    http.get(`http://127.0.0.1:${PORT}/api/health`, (res) => {
      if (res.statusCode === 200) {
        log('HEALTH', `Backend is ready and responding at http://127.0.0.1:${PORT}`);
        callback();
      } else {
        setTimeout(check, 500);
      }
    }).on('error', () => {
      setTimeout(check, 500);
    });
  };
  check();
}

function startTunnel() {
  if (isShuttingDown) return;
  log('TUNNEL', `Launching Cloudflare tunnel pointing to http://127.0.0.1:${PORT}...`);

  tunnelProcess = spawn(CLOUDFLARED_PATH, ['tunnel', '--url', `http://127.0.0.1:${PORT}`], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const handleTunnelOutput = (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      const match = line.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i);
      if (match) {
        currentLiveUrl = match[0];
        const banner = `=======================================================\n` +
          `SURAKSHA DRISHTI . AI - PUBLIC LIVE ACCESS\n` +
          `=======================================================\n` +
          `Main Dashboard:        ${currentLiveUrl}\n` +
          `Official Reports Page: ${currentLiveUrl}/reports\n` +
          `Local Host:            http://localhost:${PORT}\n` +
          `Updated At:            ${new Date().toISOString()}\n` +
          `=======================================================\n`;

        try {
          fs.writeFileSync(LIVE_URL_FILE, banner, 'utf8');
        } catch(e) {}
        log('LIVE-URL', `>>> LIVE ONLINE AT: ${currentLiveUrl} <<<`);
        log('LIVE-URL', `>>> REPORTS URL:    ${currentLiveUrl}/reports <<<`);
      }
    }
  };

  tunnelProcess.stdout.on('data', handleTunnelOutput);
  tunnelProcess.stderr.on('data', handleTunnelOutput);

  tunnelProcess.on('close', (code) => {
    if (!isShuttingDown) {
      log('TUNNEL', `Cloudflare tunnel process exited with code ${code}. Respawning in 3s...`);
      setTimeout(startTunnel, 3000);
    }
  });
}

setInterval(() => {
  if (currentLiveUrl) {
    https.get(`${currentLiveUrl}/api/health`, (res) => {
      if (res.statusCode === 200) {
        log('WATCHDOG', `Tunnel OK (HTTP 200): ${currentLiveUrl}`);
      }
    }).on('error', () => {});
  }
}, 20000);

startBackend();
waitForBackend(startTunnel);
