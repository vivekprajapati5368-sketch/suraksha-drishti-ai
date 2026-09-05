const { app, server } = require('./src/server');
const http = require('http');

async function testEndpoint(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  // Give server a moment to start
  await new Promise(r => setTimeout(r, 600));

  console.log('--- RUNNING BACKEND TESTS ---');

  // 1. Health
  const health = await testEndpoint('/api/health');
  console.log('Health:', health.status, health.body.status);

  // 2. Auth Login Admin
  const login = await testEndpoint('/api/auth/login', 'POST', {
    email: 'admin@surakshadrishti.in',
    password: 'Admin123'
  });
  console.log('Login:', login.status, login.body.user?.role, 'Token received:', !!login.body.token);

  // 3. Dashboard Stats
  const stats = await testEndpoint('/api/dashboard/stats');
  console.log('Dashboard Stats:', stats.status, 'Total Habitations:', stats.body.data?.metrics?.totalHabitations);

  // 4. Habitations
  const habs = await testEndpoint('/api/habitations');
  console.log('Habitations Count:', habs.body.count);

  // 5. Hazard Zones
  const hazards = await testEndpoint('/api/hazard-zones');
  console.log('Hazard Zones Count:', hazards.body.count);

  // 6. Safe Zones
  const safes = await testEndpoint('/api/safe-zones');
  console.log('Safe Zones Count:', safes.body.count);

  // 7. Relocation Recommendations for Joshimath (ID 1)
  const recs = await testEndpoint('/api/recommendations/1');
  console.log('Recommendations for Hab 1:', recs.body.data?.recommendations?.length, 'Top match:', recs.body.data?.recommendations?.[0]?.safeZoneName);

  // 8. Trigger Simulation
  const sim = await testEndpoint('/api/simulate-alert', 'POST', {
    scenario: 'Cloudburst',
    targetState: 'Uttarakhand'
  });
  console.log('Simulation triggered:', sim.body.message);

  // 9. Reset Simulation
  const reset = await testEndpoint('/api/simulation/reset', 'POST');
  console.log('Simulation reset:', reset.body.message);

  console.log('--- ALL BACKEND TESTS PASSED! ---');
  server.close();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  server.close();
  process.exit(1);
});
