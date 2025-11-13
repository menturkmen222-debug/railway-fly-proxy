import http from 'http';
const PORT = parseInt(process.env.PORT || '8080');

function fetchFromRailway(id) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const req = https.request({
      hostname: 'railway.gov.tm',
      path: `/railway-api/bookings/${id}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'X-Device-Id': 'a77b5c929d9403811356e4dcf959973f',
      },
      timeout: 12000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.end();
  if (req.method === 'GET' && url.pathname === '/booking') {
    const id = url.searchParams.get('id');
    if (!id || !/^[A-Z0-9]{6}$/.test(id)) {
      res.writeHead(400); return res.end(JSON.stringify({error: '6 ta katta harf/raqam'}));
    }
    try {
      const data = await fetchFromRailway(id);
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({error: 'railway.gov.tm ga ulanishda xatolik'}));
    }
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => console.log('✅ Ishga tushdi'));
