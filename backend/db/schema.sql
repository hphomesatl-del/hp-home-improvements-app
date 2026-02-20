-- HP Home Improvements Database Schema

-- Drop existing tables (for fresh start)
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS phase_updates CASCADE;
DROP TABLE IF EXISTS customer_decisions CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table (for authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer', -- admin, pm, contractor, customer, designer
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractors Table
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  trade VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(255),
  calendar_id VARCHAR(255),
  crew TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  address TEXT NOT NULL,
  start_date TIMESTAMP,
  designer_id UUID,
  pm_id UUID,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in-progress, completed, on-hold
  estimated_budget DECIMAL(12,2),
  actual_budget DECIMAL(12,2),
  customer_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (designer_id) REFERENCES users(id),
  FOREIGN KEY (pm_id) REFERENCES users(id)
);

-- Phases Table (Work phases/tasks)
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  contractor_id UUID REFERENCES contractors(id),
  phase_order INT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in-progress, completed, on-hold
  planned_start_day INT,
  planned_duration_days INT,
  planned_start_date TIMESTAMP,
  planned_end_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  materials TEXT[], -- Array of material descriptions
  depends_on UUID[], -- Array of phase IDs this depends on
  requires_customer_decision VARCHAR(255),
  is_critical_path BOOLEAN DEFAULT false,
  quality_checkpoint BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Customer Decisions Table
CREATE TABLE customer_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- plumbing, electrical, cabinets, countertops, trim, tile, paint
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, ordered, installed
  deadline TIMESTAMP,
  selections JSONB, -- Store flexible selection data
  vendor_info JSONB, -- Supplier, contact, pricing
  photos TEXT[], -- Array of photo URLs
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Phase Updates (Status updates, photos, notes)
CREATE TABLE phase_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES users(id),
  status VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos Table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES customer_decisions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255),
  caption TEXT,
  phase_type VARCHAR(50), -- before, during, after
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer_email ON projects(customer_email);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_phases_project_id ON phases(project_id);
CREATE INDEX idx_phases_status ON phases(status);
CREATE INDEX idx_phases_contractor_id ON phases(contractor_id);
CREATE INDEX idx_decisions_project_id ON customer_decisions(project_id);
CREATE INDEX idx_decisions_category ON customer_decisions(category);
CREATE INDEX idx_photos_phase_id ON photos(phase_id);
CREATE INDEX idx_photos_project_id ON photos(project_id);
