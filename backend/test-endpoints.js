// Simple endpoint tester for backend
const http = require('http');

const baseURL = process.env.BASE_URL || 'http://localhost:5001';

const endpoints = [
  '/health',
  '/api/customers',
  '/api/projects',
  '/api/contractors',
  '/api/phases'
];

console.log(`\n🧪 Testing Backend Endpoints at ${baseURL}\n`);

let tested = 0;
let passed = 0;

endpoints.forEach((endpoint, index) => {
  setTimeout(() => {
    const url = new URL(baseURL + endpoint);
    
    const request = http.get(url, (res) => {
      tested++;
      if (res.statusCode >= 200 && res.statusCode < 500) {
        passed++;
        console.log(`✅ ${endpoint} - Status ${res.statusCode}`);
      } else {
        console.log(`❌ ${endpoint} - Status ${res.statusCode}`);
      }
      
      if (tested === endpoints.length) {
        console.log(`\n📊 Results: ${passed}/${tested} endpoints responding`);
        process.exit(passed === tested ? 0 : 1);
      }
    });
    
    request.on('error', (err) => {
      tested++;
      console.log(`❌ ${endpoint} - ${err.message}`);
      if (tested === endpoints.length) {
        console.log(`\n📊 Results: ${passed}/${tested} endpoints responding`);
        process.exit(1);
      }
    });
  }, index * 500);
});

// Timeout if tests take too long
setTimeout(() => {
  console.error('\n⏱️ Timeout: Backend took too long to respond');
  process.exit(1);
}, 10000);
