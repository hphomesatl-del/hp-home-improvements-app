#!/usr/bin/env node

const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const projectIds = {
  'rachford': '03ddbb8d-79d7-4f0b-a2d5-38f792a34506',
  'martin': 'eb3d3b49-967c-480a-9b89-c2ed629c6ac1',
  'elsakr': 'f586e7ac-0fd6-45b5-baed-d9eff886c927',
  'goethals': '16dc8125-10f3-4966-811c-e5ecc9aab1d5',
  'davis': 'de775949-ce67-40af-948c-2c4de555e1a9',
  'sylves': '9cc6b84e-5ea7-45fc-9428-1f45a2898a70'
};

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function updateProjectBalance(projectId, payments, changeOrders = 0) {
  const projectRes = await makeRequest('GET', `/api/projects/${projectId}`);
  const project = projectRes.data;
  
  const originalEstimate = parseFloat(project.estimated_budget) || 0;
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p), 0);
  const newActualBudget = originalEstimate + changeOrders - totalPayments;
  
  const updateRes = await makeRequest('PUT', `/api/projects/${projectId}`, {
    actual_budget: newActualBudget.toFixed(2)
  });
  
  return {
    project: project.customer_name,
    estimate: originalEstimate,
    changeOrders: changeOrders,
    payments: payments,
    totalPaid: totalPayments,
    balance: newActualBudget
  };
}

async function main() {
  console.log('💰 Project Payment Tracker');
  console.log('========================');
  console.log('Available projects: ' + Object.keys(projectIds).join(', '));
  console.log('\nFormat: project payment1 payment2 [changeOrders]');
  console.log('Examples:');
  console.log('  sylves 5000 15000');
  console.log('  rachford 25000');
  console.log('Type "done" when finished\n');
  
  const updates = [];
  
  const askNext = () => {
    rl.question('Payment: ', async (input) => {
      if (input.toLowerCase() === 'done') {
        rl.close();
        return;
      }
      
      const parts = input.trim().split(/\s+/);
      if (parts.length < 2) {
        console.log('❌ Format: project payment1 [payment2] [changeOrders]');
        return askNext();
      }
      
      const projectKey = parts[0].toLowerCase();
      const payments = parts.slice(1).map(p => parseFloat(p.replace(/[^0-9.-]/g, ''))).filter(n => !isNaN(n));
      
      if (!projectIds[projectKey]) {
        console.log('❌ Unknown project:', projectKey);
        console.log('Available:', Object.keys(projectIds).join(', '));
        return askNext();
      }
      
      try {
        const result = await updateProjectBalance(projectIds[projectKey], payments, 0);
        updates.push(result);
        console.log(`✅ ${result.project}`);
        console.log(`   Balance Due: $${Math.abs(result.balance).toLocaleString()}`);
        console.log('');
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
      
      askNext();
    });
  };
  
  askNext();
  
  rl.on('close', () => {
    console.log('\n📊 FINAL BALANCES:');
    updates.forEach(u => {
      console.log(`${u.project.padEnd(25)}: $${Math.abs(u.balance).toLocaleString()}`);
    });
    process.exit(0);
  });
}

main();
