-- Migration: Add customer_timeline_photos table for customer-uploaded project photos

CREATE TABLE IF NOT EXISTS customer_timeline_photos (
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

CREATE INDEX IF NOT EXISTS idx_ctp_project_id ON customer_timeline_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_ctp_phase_id ON customer_timeline_photos(phase_id);
CREATE INDEX IF NOT EXISTS idx_ctp_uploaded_by ON customer_timeline_photos(uploaded_by);
