const localtunnel = require('localtunnel');
const http = require('http');

const PORT = process.env.PORT || 5000;

async function getPublicIp() {
  return new Promise((resolve) => {
    http.get('http://api.ipify.org', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => resolve('Available via IP lookup'));
  });
}

async function startLiveTunnel() {
  const publicIp = await getPublicIp();
  console.log('Connecting Suraksha Drishti AI to Worldwide Live Host...');

  try {
    const tunnel = await localtunnel({
      port: PORT
    });

    console.log(`=======================================================`);
    console.log(`🌍 SURAKSHA DRISHTI AI - WORLDWIDE LIVE HOST ONLINE`);
    console.log(`🔗 LIVE PUBLIC URL:      ${tunnel.url}`);
    console.log(`🔑 TUNNEL PASSWORD (IP): ${publicIp}`);
    console.log(`📱 LOCAL WI-FI (LAN):    http://192.168.1.14:${PORT}`);
    console.log(`=======================================================`);

    tunnel.on('close', () => {
      console.log('Tunnel connection closed. Reconnecting in 3 seconds...');
      setTimeout(startLiveTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      setTimeout(startLiveTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to create tunnel, retrying in 3s:', err.message);
    setTimeout(startLiveTunnel, 3000);
  }
}

startLiveTunnel();
