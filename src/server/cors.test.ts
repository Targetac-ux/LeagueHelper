import http from 'http';

const options: http.RequestOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://example.com',
    'Access-Control-Request-Method': 'GET',
  },
};

const req = http.request(options, (res) => {
  const cors = res.headers['access-control-allow-origin'];
  const methods = res.headers['access-control-allow-methods'];

  if (cors === '*') {
    console.log('PASS: CORS allows any origin');
  } else {
    console.error('FAIL: CORS origin is', cors);
    process.exit(1);
  }

  if (methods && methods.includes('GET')) {
    console.log('PASS: CORS allows GET');
  } else {
    console.error('FAIL: CORS methods are', methods);
    process.exit(1);
  }

  console.log('\nAll CORS tests passed!');
});

req.on('error', (err) => {
  console.error('CORS test failed:', err.message);
  process.exit(1);
});

req.end();
