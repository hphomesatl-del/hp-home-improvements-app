-- Add Chris & Becky Gerrard Project - Estimate #26013
-- Kitchen Addition & Renovation (16' x 20' addition)
-- 1262 Reeder Cir, Atlanta, GA 30306
-- Budget: $163,413.15 | Start: April 1, 2026

BEGIN;

-- Insert project
INSERT INTO projects (id, customer_name, customer_email, customer_phone, address, start_date, estimated_budget, status, notes)
VALUES (
  'a7c3e1f0-2601-4300-b013-ae00a0d26013',
  'Chris & Becky Gerrard',
  NULL,
  NULL,
  '1262 Reeder Cir, Atlanta, GA 30306',
  '2026-04-01',
  163413.15,
  'planning',
  'Estimate #26013 - Kitchen Addition & Renovation (16'' x 20'' addition). 23 scope items including permits, site work, demo, concrete, masonry, framing, windows, roof, doors, insulation, siding, deck, HVAC, plumbing, electrical, drywall, trim, flooring, painting, tile, cabinets coordination, countertops coordination, change order terms.'
);

-- Insert phases
-- Contractor IDs:
--   Fidel (Carpentry): 2c2ded77-cad0-481c-98ec-6255ab878bc3
--   Jose (Painting): ceec0461-c2ce-4292-b40c-dfdaa653df1a
--   Hector (Plumbing/HVAC): 7dd0516c-b46a-4360-aad0-1a0ecddcf81f
--   Axel (Electrical): a1237c07-8f11-4c54-b0fa-d1ba496aae9b
--   Andres (Tile): 561a12a0-6006-459d-aa41-7fc0580d8369
--   Jorge (Drywall): 3316b291-1d33-4ca0-b113-ea641a6cffc9
--   Luciano (Flooring): b1d2abed-b2a4-453b-ad23-2e8a073469a1
--   Teresa (Design): 4d74d81b-0513-442b-9d3b-5bce1ce65132
--   Daniel (Cabinets): fea4fea2-7718-45cf-b451-a05d21558440

INSERT INTO phases (id, project_id, name, description, phase_order, planned_start_date, planned_end_date, contractor_id, status, is_critical_path) VALUES
-- Phase 1: Plans & Permits (Apr 1-15, 2 weeks)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Plans & Permits', 'Building permits, architectural plans, HOA approval', 1, '2026-04-01', '2026-04-15', NULL, 'pending', true),

-- Phase 2: Site Preparation (Apr 16-20, 5 days)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Site Preparation', 'Site work, grading, temporary utilities, dumpster', 2, '2026-04-16', '2026-04-20', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', true),

-- Phase 3: Demolition (Apr 21-25, 5 days)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Demolition', 'Demo existing kitchen, remove walls for addition tie-in', 3, '2026-04-21', '2026-04-25', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', true),

-- Phase 4: Concrete & Foundation (Apr 28-May 9, 2 weeks)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Concrete & Foundation', 'Footings, foundation walls, slab pour for 16x20 addition', 4, '2026-04-28', '2026-05-09', NULL, 'pending', true),

-- Phase 5: Masonry (May 11-16, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Masonry', 'Block/brick work, foundation waterproofing', 5, '2026-05-11', '2026-05-16', NULL, 'pending', true),

-- Phase 6: Framing (May 18-Jun 6, 3 weeks)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Framing', 'Wall framing, floor/ceiling joists, roof rafters for 16x20 addition, tie-in to existing structure', 6, '2026-05-18', '2026-06-06', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', true),

-- Phase 7: Windows (Jun 8-13, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Windows', 'Window installation in addition', 7, '2026-06-08', '2026-06-13', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', false),

-- Phase 8: Roofing (Jun 15-20, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Roofing', 'Roof sheathing, felt, shingles, flashing, tie-in to existing roof', 8, '2026-06-15', '2026-06-20', NULL, 'pending', true),

-- Phase 9: Exterior Doors (Jun 22-24, 3 days)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Exterior Doors', 'Install exterior doors for addition', 9, '2026-06-22', '2026-06-24', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', false),

-- Phase 10: Siding (Jun 25-Jul 3, ~1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Siding', 'Exterior siding to match existing home', 10, '2026-06-25', '2026-07-03', NULL, 'pending', false),

-- Phase 11: Deck (Jul 6-11, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Deck', 'Deck construction/modification', 11, '2026-07-06', '2026-07-11', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', false),

-- Phase 12: HVAC Rough-In (Jun 22-27, 1 week - parallel with doors/siding)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'HVAC Rough-In', 'Ductwork, HVAC rough-in for addition', 12, '2026-06-22', '2026-06-27', '7dd0516c-b46a-4360-aad0-1a0ecddcf81f', 'pending', true),

-- Phase 13: Plumbing Rough-In (Jun 22-27, 1 week - parallel)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Plumbing Rough-In', 'Kitchen plumbing rough-in, water/drain lines', 13, '2026-06-22', '2026-06-27', '7dd0516c-b46a-4360-aad0-1a0ecddcf81f', 'pending', true),

-- Phase 14: Electrical Rough-In (Jun 29-Jul 3, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Electrical Rough-In', 'Wiring, panel upgrade, circuits for kitchen appliances', 14, '2026-06-29', '2026-07-03', 'a1237c07-8f11-4c54-b0fa-d1ba496aae9b', 'pending', true),

-- Phase 15: Insulation (Jul 6-8, 3 days)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Insulation', 'Wall and ceiling insulation for addition', 15, '2026-07-06', '2026-07-08', NULL, 'pending', true),

-- Phase 16: Drywall (Jul 9-18, ~10 days)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Drywall', 'Hang, tape, mud, sand - walls and ceilings', 16, '2026-07-09', '2026-07-18', '3316b291-1d33-4ca0-b113-ea641a6cffc9', 'pending', true),

-- Phase 17: Trim & Millwork (Jul 20-25, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Trim & Millwork', 'Crown molding, baseboards, casing, interior doors', 17, '2026-07-20', '2026-07-25', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', false),

-- Phase 18: Interior Painting (Jul 27-Aug 1, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Interior Painting', 'Prime and paint walls, ceilings, trim', 18, '2026-07-27', '2026-08-01', 'ceec0461-c2ce-4292-b40c-dfdaa653df1a', 'pending', false),

-- Phase 19: Cabinets Coordination (Aug 3-8, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Cabinets Installation', 'Cabinet delivery and installation coordination', 19, '2026-08-03', '2026-08-08', 'fea4fea2-7718-45cf-b451-a05d21558440', 'pending', true),

-- Phase 20: Countertops Coordination (Aug 10-15, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Countertops Installation', 'Template, fabrication, and installation coordination', 20, '2026-08-10', '2026-08-15', NULL, 'pending', true),

-- Phase 21: Tile Work (Aug 17-22, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Tile Work', 'Backsplash, floor tile as specified', 21, '2026-08-17', '2026-08-22', '561a12a0-6006-459d-aa41-7fc0580d8369', 'pending', false),

-- Phase 22: Flooring (Aug 24-29, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Flooring Installation', 'Hardwood/LVP flooring installation', 22, '2026-08-24', '2026-08-29', 'b1d2abed-b2a4-453b-ad23-2e8a073469a1', 'pending', false),

-- Phase 23: Final Finishes & Punch List (Aug 31-Sep 5, 1 week)
(gen_random_uuid(), 'a7c3e1f0-2601-4300-b013-ae00a0d26013', 'Final Finishes & Punch List', 'Plumbing/electrical finals, appliance install, hardware, touch-ups, final inspection, change order reconciliation', 23, '2026-08-31', '2026-09-05', '2c2ded77-cad0-481c-98ec-6255ab878bc3', 'pending', false);

COMMIT;
