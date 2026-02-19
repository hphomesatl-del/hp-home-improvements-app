# HP Home Improvements App - Architecture

## System Overview

A full-stack application for managing kitchen renovation projects from initial planning through completion. The system tracks contractor tasks, customer decisions, project timeline, and resource allocation.

## Core Entities

### 1. Project
```json
{
  "id": "uuid",
  "customerName": "string",
  "address": "string",
  "startDate": "ISO-8601",
  "designerId": "uuid",
  "status": "planning|in-progress|completed",
  "budget": {
    "estimated": "number",
    "actual": "number"
  },
  "phases": ["phase-ids"],
  "customerDecisions": ["decision-ids"],
  "notes": "string"
}
```

### 2. Phase (Task)
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "string",
  "description": "string",
  "contractor": {
    "id": "uuid",
    "name": "string"
  },
  "status": "pending|in-progress|completed",
  "timeline": {
    "plannedStart": "ISO-8601",
    "plannedEnd": "ISO-8601",
    "actualStart": "ISO-8601",
    "actualEnd": "ISO-8601",
    "durationDays": "number"
  },
  "materials": ["string"],
  "photos": ["url"],
  "notes": "string",
  "dependsOn": ["phase-ids"],
  "requiresCustomerDecision": "decision-id"
}
```

### 3. Customer Decision
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "category": "plumbing|electrical|cabinets|countertops|trim|tile|paint",
  "status": "pending|approved|ordered|installed",
  "deadline": "ISO-8601",
  "selections": {
    "item1": "choice",
    "item2": "choice"
  },
  "vendors": {
    "supplierId": "uuid",
    "contactInfo": "string",
    "pricing": "number"
  },
  "photos": ["url"],
  "notes": "string"
}
```

### 4. Contractor
```json
{
  "id": "uuid",
  "name": "string",
  "trade": "string",
  "contact": {
    "phone": "string",
    "email": "string",
    "address": "string"
  },
  "company": "string",
  "crew": ["names"],
  "calendar": "calendar-id",
  "specialties": ["string"],
  "rating": "number",
  "notes": "string"
}
```

## Database Schema (PostgreSQL)

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  address TEXT,
  start_date TIMESTAMP,
  designer_id UUID,
  status VARCHAR(50),
  estimated_budget DECIMAL(10,2),
  actual_budget DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Phases Table
```sql
CREATE TABLE phases (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255),
  description TEXT,
  contractor_id UUID REFERENCES contractors(id),
  status VARCHAR(50),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  duration_days INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Customer Decisions Table
```sql
CREATE TABLE customer_decisions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  category VARCHAR(50),
  status VARCHAR(50),
  deadline DATE,
  selections JSONB,
  vendor_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contractors Table
```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  trade VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  company VARCHAR(255),
  calendar_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Projects
- `GET /api/projects` — List all projects
- `GET /api/projects/:id` — Get project details
- `POST /api/projects` — Create new project
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

### Phases
- `GET /api/projects/:id/phases` — List project phases
- `GET /api/phases/:id` — Get phase details
- `PUT /api/phases/:id` — Update phase status/timeline
- `POST /api/phases/:id/photos` — Upload phase photos

### Customer Decisions
- `GET /api/projects/:id/decisions` — List pending decisions
- `POST /api/projects/:id/decisions` — Create decision
- `PUT /api/decisions/:id` — Update decision status
- `POST /api/decisions/:id/approve` — Approve decision

### Contractors
- `GET /api/contractors` — List all contractors
- `GET /api/contractors/:id` — Get contractor details

### Dashboard
- `GET /api/dashboard/overview` — High-level project status
- `GET /api/dashboard/timeline` — Gantt chart data
- `GET /api/dashboard/decisions-pending` — Upcoming decision deadlines

## Frontend Features

### Project Dashboard
- **Active projects list** with status badges
- **Timeline view** (Gantt chart) of phases
- **Progress indicators** (% complete)
- **Upcoming decision deadlines** highlighted
- **Quick actions** (update phase, approve decision, upload photo)

### Phase Management
- **Phase detail view** with timeline, contractor, materials
- **Photo gallery** (before/during/after)
- **Update status** (pending → in-progress → completed)
- **Actual vs. planned timeline comparison**
- **Notes/comments** for each phase

### Customer Portal (Customer-facing)
- **Decision checklist** with explanations
- **Selection samples** (colors, materials)
- **Deadline countdown** for each decision
- **Approval workflow** (review → approve → vendor contact)
- **Project timeline** showing their decisions' impact

### Admin Features
- **Contractor management** (add/edit/remove)
- **Project analytics** (completion rates, budget tracking)
- **Template management** (customize phase lists for different project types)
- **User/team management**

## Integrations

### Google Calendar
- Sync contractor availability
- Auto-update phase start/end dates
- Send deadline reminders to team/customers

### Google Sheets (Current)
- Read 60-day renovation timeline
- Sync project data for reporting

### Twilio (Future)
- SMS reminders for customer decisions
- Contractor schedule updates
- Progress notifications

### Photo Storage
- AWS S3 or similar for before/during/after photos
- Organized by project and phase

## Security & Access Control

### Role-based Access
- **Admin** — Full project management, contractor management, analytics
- **Project Manager** — Assign tasks, update timelines, approve decisions
- **Contractor** — View assigned phases, update status, upload photos
- **Customer** — View project timeline, make decisions, view progress
- **Designer** — Manage customer selections, approve materials

### Data Privacy
- Customer phone numbers encrypted
- Contractor pricing private to admin/PM
- Photo sharing controlled per customer

## Deployment

### Development
- Local PostgreSQL
- Node.js + Express backend
- React/Vue frontend
- Docker Compose for local dev environment

### Production
- AWS RDS for PostgreSQL
- AWS EC2 or Heroku for backend
- AWS S3 for photos
- Vercel or similar for frontend
- CloudFlare for CDN

## Performance Considerations

- Cache contractor list in memory (slow-changing data)
- Paginate project lists (50 per page)
- Lazy-load phase photos
- Index on `project_id`, `status`, `contractor_id` in database
- Use WebSockets for real-time phase updates

## Future Enhancements

1. **Mobile app** for contractors to update status on-site
2. **Material ordering integration** with suppliers
3. **Finalize with client sign-off workflow**
4. **Budget vs. actual cost tracking**
5. **Customer satisfaction surveys**
6. **Before/after portfolio generation** for marketing
7. **Recurring project templates** (standardize common kitchen configurations)
8. **Advanced analytics** (average phase duration, contractor efficiency, etc.)
