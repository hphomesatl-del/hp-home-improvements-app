-- HP Home Improvements - Comprehensive Database Schema
-- Generated to cover all API routes

-- Drop ALL tables for a clean start
DROP TABLE IF EXISTS customer_project_documents CASCADE;
DROP TABLE IF EXISTS customer_project_pictures CASCADE;
DROP TABLE IF EXISTS customer_timeline_photos CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS project_photos CASCADE;
DROP TABLE IF EXISTS project_plans CASCADE;
DROP TABLE IF EXISTS phase_updates CASCADE;
DROP TABLE IF EXISTS customer_decisions CASCADE;
DROP TABLE IF EXISTS inspirations CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ============================================
-- USERS TABLE (authentication & authorization)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMERS TABLE (legacy customer data)
-- ============================================
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'active',
  projectName VARCHAR(255),
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTRACTORS TABLE
-- ============================================
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

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  address TEXT NOT NULL,
  start_date TIMESTAMP,
  designer_id UUID REFERENCES users(id),
  pm_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'planning',
  estimated_budget DECIMAL(12,2),
  actual_budget DECIMAL(12,2),
  customer_id UUID REFERENCES users(id),
  category VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHASES TABLE (work phases/tasks)
-- ============================================
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  contractor_id UUID REFERENCES contractors(id),
  phase_order INT,
  status VARCHAR(50) DEFAULT 'pending',
  planned_start_day INT,
  planned_duration_days INT,
  planned_start_date TIMESTAMP,
  planned_end_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  materials TEXT[],
  depends_on UUID[],
  requires_customer_decision VARCHAR(255),
  is_critical_path BOOLEAN DEFAULT false,
  quality_checkpoint BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER DECISIONS TABLE
-- ============================================
CREATE TABLE customer_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  deadline TIMESTAMP,
  selections JSONB,
  vendor_info JSONB,
  photos TEXT[],
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHASE UPDATES TABLE
-- ============================================
CREATE TABLE phase_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES users(id),
  status VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSPIRATIONS TABLE
-- ============================================
CREATE TABLE inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHOTOS TABLE (phase/decision photos)
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES customer_decisions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  cloudinary_id VARCHAR(255),
  caption TEXT,
  phase_type VARCHAR(50),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECT PHOTOS TABLE (trades: electric, plumbing, framing)
-- ============================================
CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trade VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECT PLANS TABLE
-- ============================================
CREATE TABLE project_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER TIMELINE PHOTOS TABLE
-- ============================================
CREATE TABLE customer_timeline_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  caption TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER PROJECT PICTURES TABLE
-- ============================================
CREATE TABLE customer_project_pictures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CUSTOMER PROJECT DOCUMENTS TABLE (PDFs)
-- ============================================
CREATE TABLE customer_project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) DEFAULT 'pdf',
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
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
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_project_photos_trade ON project_photos(trade);
CREATE INDEX idx_project_plans_project_id ON project_plans(project_id);
CREATE INDEX idx_ctp_project_id ON customer_timeline_photos(project_id);
CREATE INDEX idx_ctp_phase_id ON customer_timeline_photos(phase_id);
CREATE INDEX idx_ctp_uploaded_by ON customer_timeline_photos(uploaded_by);
CREATE INDEX idx_cpp_project_id ON customer_project_pictures(project_id);
CREATE INDEX idx_cpd_project_id ON customer_project_documents(project_id);
