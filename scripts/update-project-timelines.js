#!/usr/bin/env node

const http = require('http');

const projectTimelineData = {
  '03ddbb8d-79d7-4f0b-a2d5-38f792a34506': { // Rachford - Insulation/Drywall (15-16)
    baseDate: '2026-02-19',
    currentPhaseStart: 15,
    phaseDurations: [5,2,4,3,4,5,3,3,4,3,3,2,3,4,2,4,4,4,3,2,2,1] // 22 phases
  },
  'eb3d3b49-967c-480a-9b89-c2ed629c6ac1': { // Martin - Electrical Final (15/16)
    baseDate: '2026-02-19',
    currentPhaseStart: 15,
    phaseDurations: [4,5,3,3,2,2,4,3,3,3,2,2,2,4,2,1] // 16 phases
  },
  'f586e7ac-0fd6-45b5-baed-d9eff886c927': { // El Sakr - Final Inspection (14/14)
    baseDate: '2026-02-19',
    currentPhaseStart: 14,
    phaseDurations: [3,4,3,2,2,2,3,3,3,2,3,2,2,2] // 14 phases
  },
  '16dc8125-10f3-4966-811c-e5ecc9aab1d5': { // Goethals - Patio Drywall (22/27)
    baseDate: '2026-02-19',
    currentPhaseStart: 22,
    phaseDurations: Array(27).fill(2) // Simplified 27 phases
  },
  'de775949-ce67-40af-948c-2c4de555e1a9': { // Kelly Davis - Kitchen Painting (8/28)
    baseDate: '2026-02-19',
    currentPhaseStart: 8,
    phaseDurations: Array(28).fill(2) // Simplified 28 phases
  },
  '9cc6b84e-5ea7-45fc-9428-1f45a2898a70': { // Sylves - Post-Demo (2/17)
    baseDate: '2026-02-19',
    currentPhaseStart: 2,
    phaseDurations: [3,2,2,2,1,3,2,2,4,1,1,1,1,1,1,1,1] // 17 phases
  }
};

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function updateProjectTimeline(projectId, timelineData) {
  const projectRes = await makeRequest('GET', `/api/projects/${projectId}`);
  const phases = projectRes.data.phases;
  
  const baseDate = new Date(timelineData.baseDate);
  const daysBeforeCurrent = phases.slice(0, timelineData.currentPhaseStart - 1)
    .reduce((sum, p, i) => sum + (timelineData.phaseDurations[i] || 2), 0);
  
  baseDate.setDate(baseDate.getDate() - daysBeforeCurrent);
  
  let updated = 0;
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + 
      phases.slice(0, i).reduce((sum, p, j) => sum + (timelineData.phaseDurations[j] || 2), 0));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (timelineData.phaseDurations[i] || 2) - 1);
    
    const updateRes = await makeRequest('PUT', `/api/phases/${phase.id}`, {
      planned_start_date: startDate.toISOString().split('T')[0],
      planned_end_date: endDate.toISOString().split('T')[0]
    });
    
    if (updateRes.status === 200) updated++;
  }
  
  return updated;
}

async function main() {
  console.log('📅 Updating ALL project timelines to align with Feb 19, 2026...\n');
  
  let totalUpdated = 0;
  for (const [projectId, timelineData] of Object.entries(projectTimelineData)) {
    console.log(`Updating ${timelineData.currentPhaseStart}: Current phase...`);
    const updated = await updateProjectTimeline(projectId, timelineData);
    totalUpdated += updated;
    console.log(`✅ ${updated} phases updated\n`);
  }
  
  console.log(`🎯 COMPLETE: ${totalUpdated} total phases realigned!`);
  console.log('All timelines now match current construction progress.');
}

main().catch(console.error);
