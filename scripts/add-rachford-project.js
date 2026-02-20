#!/usr/bin/env node

const http = require('http');

const projectData = {
  customer_name: 'Matt & Meghan Rachford',
  customer_email: 'rachford@example.com',
  customer_phone: '(770) 000-0000',
  address: '2361 Ewing Drive NE, Brookhaven, GA 30319',
  start_date: '2026-02-23',
  estimated_budget: 86772.71,
  notes: 'Kitchen and Exterior bump out renovation (Permitted). Estimate #25121. Designer: Teresa Hamilton (TLHD).'
};

const phasesData = [
  { name: 'Plans and Permits', order: 1, duration: 5, start_day: 0, critical: false },
  { name: 'Site Work/Prep', order: 2, duration: 2, start_day: 5, critical: false },
  { name: 'Demolition', order: 3, duration: 4, start_day: 7, critical: true },
  { name: 'Concrete Footings', order: 4, duration: 3, start_day: 11, critical: true },
  { name: 'Floor Frame', order: 5, duration: 4, start_day: 14, critical: true },
  { name: 'Wall Frame', order: 6, duration: 5, start_day: 18, critical: true },
  { name: 'Roof Frame', order: 7, duration: 3, start_day: 23, critical: false },
  { name: 'Roof (Remove/Replace)', order: 8, duration: 3, start_day: 26, critical: false },
  { name: 'Windows & Trim', order: 9, duration: 4, start_day: 29, critical: false },
  { name: 'Exterior Construction', order: 10, duration: 3, start_day: 33, critical: false },
  { name: 'Siding', order: 11, duration: 3, start_day: 36, critical: false },
  { name: 'Interior Doors', order: 12, duration: 2, start_day: 39, critical: false },
  { name: 'HVAC Rough-in', order: 13, duration: 3, start_day: 41, critical: false },
  { name: 'Electrical Rough-in', order: 14, duration: 4, start_day: 44, critical: false },
  { name: 'Insulation', order: 15, duration: 2, start_day: 48, critical: false, current: true },
  { name: 'Drywall', order: 16, duration: 4, start_day: 50, critical: false, current: true },
  { name: 'Interior Painting', order: 17, duration: 4, start_day: 54, critical: false },
  { name: 'Hardwood Flooring', order: 18, duration: 4, start_day: 58, critical: false },
  { name: 'Interior Millwork Trim', order: 19, duration: 3, start_day: 62, critical: false },
  { name: 'Kitchen Remodel (Final)', order: 20, duration: 2, start_day: 65, critical: true },
  { name: 'HVAC/Electrical Trim', order: 21, duration: 2, start_day: 67, critical: false },
  { name: 'Final Inspection', order: 22, duration: 1, start_day: 69, critical: false }
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
  console.log('🚀 Adding Rachford Kitchen & Exterior Renovation Project...\n');

  try {
    // Create project
    console.log('📋 Creating project...');
    const projectRes = await makeRequest('POST', '/api/projects', projectData);
    
    if (projectRes.status !== 201) {
      console.error('❌ Failed to create project:', projectRes.data);
      process.exit(1);
    }

    const projectId = projectRes.data.id;
    console.log(`✅ Project created: ${projectId}`);
    console.log(`   Customer: ${projectData.customer_name}`);
    console.log(`   Address: ${projectData.address}`);
    console.log(`   Budget: $${projectData.estimated_budget.toLocaleString()}\n`);

    // Add phases
    console.log('📐 Adding 22 phases...');
    let phaseCount = 0;

    for (const phase of phasesData) {
      const startDate = new Date('2026-02-23');
      startDate.setDate(startDate.getDate() + phase.start_day);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + phase.duration - 1);

      const phasePayload = {
        project_id: projectId,
        name: phase.name,
        description: `Phase ${phase.order}: ${phase.name}`,
        phase_order: phase.order,
        planned_start_date: startDate.toISOString().split('T')[0],
        planned_end_date: endDate.toISOString().split('T')[0],
        planned_duration_days: phase.duration,
        status: phase.current ? 'in-progress' : 'pending',
        is_critical_path: phase.critical
      };

      const phaseRes = await makeRequest('POST', '/api/phases', phasePayload);
      
      if (phaseRes.status === 201) {
        phaseCount++;
        const status = phase.current ? '🔄' : (phase.critical ? '🔴' : '⏳');
        console.log(`   ${status} ${phase.order}. ${phase.name} (${phasePayload.planned_start_date} - ${phasePayload.planned_end_date})`);
      } else {
        console.error(`   ❌ Failed to add phase: ${phase.name}`);
      }
    }

    console.log(`\n✅ Successfully added ${phaseCount}/${phasesData.length} phases`);
    console.log(`\n🎯 Project Details:`);
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Staff View: http://localhost:3000/projects/${projectId}`);
    console.log(`   Customer Portal: http://localhost:3000/customer/${projectId}`);
    console.log(`\n📊 Current Status: INSULATION/DRYWALL IN PROGRESS (Phases 15-16)`);
    console.log(`   Estimated Completion: Mar 28, 2026\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addProject();
