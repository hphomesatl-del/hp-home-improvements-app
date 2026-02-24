-- Add category column to projects table (Major/Minor classification)
-- Major: projects >= $30,000 (activities from Google Sheets renovation timeline)
-- Minor: projects < $30,000 (activities from estimate PDFs)

ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(10);

-- Set initial values based on estimated_budget threshold
UPDATE projects SET category = CASE 
  WHEN estimated_budget >= 30000 THEN 'Major' 
  ELSE 'Minor' 
END WHERE category IS NULL;
