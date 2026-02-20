#!/usr/bin/env node

const http = require('http');

const projectData = {
  customer_name: 'Maggy & Dave Sylves',
  customer_email: 'sylves@example.com',
  customer_phone: '(770) 000-0000',
  address: '1539 Stepstone Way, Lawrenceville, GA 30043',
  start_date: '2026-02-15',
  estimated_budget: 25970.00,
  notes: 'Bathroom Remodel Only. Estimate #25191. TLHD drawings 9-25-25. Heated Schluter floors. Wallpaper in water closet. Payment: $5K down, $15K start, balance completion.'
};

const phasesData = [
  { name: 'Site Prep & Demo Bathroom', order: 1, duration: 3, start_day: 0, status: 'completed' },
  { name: 'Frame Walls (Shower/Pocket Door)', order: 2, duration: 2, start_day: 3, status: 'pending' },
  { name: 'Electrical Rough (Can lights/Fan)', order: 3, duration: 2, start_day: 5, status: 'pending' },
  { name: 'Plumbing Rough (Shower Valve)', order: 4, duration: 2, start_day: 7, status: 'pending' },
  { name: 'Insulation (if needed)', order: 5, duration: 1, start_day: 9, status: 'pending' },
  { name: 'Drywall', order: 6, duration: 3, start_day: 10, status: 'pending' },
  { name: 'Trim Installation', order: 7, duration: 2, start_day: 13, status: 'pending' },
  { name: 'Painting', order: 8, duration: 2, start_day: 15, status: 'pending' },
  { name: 'Tile Installation (Floor/Shower)', order: 9, duration: 4, start_day: 17, status: 'pending' },
  { name: 'Shower Door Template/Ordered', order: 10, duration: 1, start_day: 21, status: 'pending' },
  { name: 'Cabinets Installed', order: 11, duration: 1, start_day: 22, status: 'pending' },
  { name: 'Countertops Template/Ordered', order: 12, duration: 1, start_day: 23, status: 'pending' },
  { name: 'Shower Door Installed', order: 13, duration: 1, start_day: 24, status: 'pending' },
  { name: 'Countertops Installed', order: 14, duration: 1, start_day: 25, status: 'pending' },
  { name: 'Plumbing Trim/Faucets', order: 15, duration: 1, start_day: 26, status: 'pending' },
  { name: 'Electrical Trim', order: 16, duration: 1, start_day: 27, status: 'pending' },
  { name: 'Final Punch Out', order: 17, duration: 1, start_day: 28, status: 'pending' }
];

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

async function addProject() {
  console.log('🛁 Adding Sylves Bathroom Remodel...\n');

  try {
    // Create project
    console.log('📋 Creating project...');
    const projectRes = await makeRequest('POST', '/api/projects', projectData);
    
    if (projectRes.status !== 201) {
      console.error('❌ Failed to create project:', projectRes.data);
      process.exit(1);
    }

    const projectId = projectRes.data.id;
    console.log(`✅ Project created: ${projectId}\n`);

    // Add phases
    console.log('🚿 Adding 17 bathroom phases...');
    let phaseCount = 0;

    for (const phase of phasesData) {
      const startDate = new Date('2026-02-15');
      startDate.setDate(startDate.getDate() + phase.start_day);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + phase.duration - 1);

      const phasePayload = {
        project_id: projectId,
        name: phase.name,
        description: `Bathroom Phase ${phase.order}`,
        phase_order: phase.order,
        planned_start_date: startDate.toISOString().split('T')[0],
        planned_end_date: endDate.toISOString().split('T')[0],
        planned_duration_days: phase.duration,
        status: phase.status,
        is_critical_path: phase.order <= 5 // Critical path for first 5 phases
      };

      const phaseRes = await makeRequest('POST', '/api/phases', phasePayload);
      
      if (phaseRes.status === 201) {
        phaseCount++;
        console.log(`   ${phase.order}. ${phase.name} (${phasePayload.status})`);
      }
    }

    console.log(`\n✅ Successfully added ${phaseCount} phases`);
    console.log(`\n🔗 Links:`);
    console.log(`   Staff: http://localhost:3000/projects/${projectId}`);
    console.log(`   Customer: http://localhost:3000/customer/${projectId}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addProject();
