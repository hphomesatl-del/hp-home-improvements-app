#!/usr/bin/env node

const http = require('http');

// Project current phases mapping
const projectPhases = {
  '03ddbb8d-79d7-4f0b-a2d5-38f792a34506': { name: 'Rachford', currentPhase: 15 }, // Insulation/Drywall
  'eb3d3b49-967c-480a-9b89-c2ed629c6ac1': { name: 'Martin', currentPhase: 14 }, // Electrical Final
  'f586e7ac-0fd6-45b5-baed-d9eff886c927': { name: 'El Sakr', currentPhase: 13 }, // Final Inspection
  '16dc8125-10f3-4966-811c-e5ecc9aab1d5': { name: 'Goethals', currentPhase: 21 }, // Patio Drywall
  'de775949-ce67-40af-948c-2c4de555e1a9': { name: 'Kelly Davis', currentPhase: 7 } // Kitchen Painting
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

async function markPhasesCompleted() {
  console.log('🚀 Marking prior phases as COMPLETED for all projects...\n');

  let totalCompleted = 0;

  for (const [projectId, info] of Object.entries(projectPhases)) {
    console.log(`📋 ${info.name} (marking phases 1-${info.currentPhase - 1} as completed):`);

    // Fetch all phases for this project
    const projectRes = await makeRequest('GET', `/api/projects/${projectId}`);
    
    if (projectRes.status !== 200) {
      console.error(`   ❌ Failed to fetch project`);
      continue;
    }

    const phases = projectRes.data.phases || [];
    let completedCount = 0;

    for (const phase of phases) {
      if (phase.phase_order < info.currentPhase) {
        const updateRes = await makeRequest('PUT', `/api/phases/${phase.id}`, {
          status: 'completed'
        });

        if (updateRes.status === 200) {
          completedCount++;
          console.log(`   ✅ Phase ${phase.phase_order}: ${phase.name}`);
        } else {
          console.log(`   ❌ Phase ${phase.phase_order}: ${phase.name}`);
        }
      }
    }

    totalCompleted += completedCount;
    console.log(`   → ${completedCount} phases marked completed\n`);
  }

  console.log(`✅ Total: ${totalCompleted} phases marked as COMPLETED across all projects\n`);
  console.log('📊 Project Status Summary:');
  console.log('   • Rachford: Phases 1-14 completed ✅, Insulation/Drywall in progress 🔄');
  console.log('   • Martin: Phases 1-13 completed ✅, Electrical Final in progress 🔄');
  console.log('   • El Sakr: Phases 1-12 completed ✅, Final Inspection in progress 🔄');
  console.log('   • Goethals: Phases 1-20 completed ✅, Patio Drywall in progress 🔄');
  console.log('   • Kelly Davis: Phases 1-6 completed ✅, Kitchen Painting in progress 🔄\n');
}

markPhasesCompleted().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
