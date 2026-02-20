-- RBAC Migration: Add customer_id to projects, ensure role column exists on users

-- Add customer_id to projects (links project to the customer user)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id);

-- Index for fast customer lookups
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

-- Ensure role column has a default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
