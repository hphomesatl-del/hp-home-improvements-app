const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  router.use(authenticateToken);
  router.use(requireAdmin);

  // GET /api/admin/dashboard — aggregated overview for owner
  router.get('/dashboard', async (req, res) => {
    try {
      // All projects with current phase info
      const projects = await pool.query(`
        SELECT 
          p.*,
          COALESCE(
            (SELECT ph.name FROM phases ph 
             WHERE ph.project_id = p.id 
             AND CURRENT_DATE >= COALESCE(ph.actual_start_date, ph.planned_start_date)::date
             AND CURRENT_DATE <= COALESCE(ph.actual_end_date, ph.planned_end_date)::date
             ORDER BY ph.phase_order ASC LIMIT 1),
            CASE
              WHEN CURRENT_DATE < (SELECT MIN(COALESCE(ph2.actual_start_date, ph2.planned_start_date))::date FROM phases ph2 WHERE ph2.project_id = p.id)
                THEN 'Planning'
              WHEN CURRENT_DATE > (SELECT MAX(COALESCE(ph2.actual_end_date, ph2.planned_end_date))::date FROM phases ph2 WHERE ph2.project_id = p.id)
                THEN 'Completed'
              ELSE p.status
            END
          ) as current_status,
          (SELECT COUNT(*) FROM phases ph WHERE ph.project_id = p.id) as total_phases,
          (SELECT COUNT(*) FROM phases ph WHERE ph.project_id = p.id AND ph.status = 'completed') as completed_phases,
          (SELECT COUNT(*) FROM customer_decisions cd WHERE cd.project_id = p.id AND cd.status = 'pending') as pending_decisions
        FROM projects p 
        ORDER BY p.created_at DESC
      `);

      // All contractors with assignment info
      const contractors = await pool.query(`
        SELECT c.*, 
          (SELECT COUNT(DISTINCT ph.project_id) FROM phases ph WHERE ph.contractor_id = c.id) as project_count,
          (SELECT string_agg(DISTINCT p.customer_name, ', ') 
           FROM phases ph JOIN projects p ON p.id = ph.project_id 
           WHERE ph.contractor_id = c.id) as assigned_projects
        FROM contractors c 
        WHERE c.active = true 
        ORDER BY c.name
      `);

      // Summary stats
      const stats = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'in_progress' OR status = 'in-progress') as active_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'completed') as completed_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'planning') as planning_projects,
          (SELECT COALESCE(SUM(estimated_budget), 0) FROM projects) as total_budget,
          (SELECT COALESCE(SUM(actual_budget), 0) FROM projects) as total_spent,
          (SELECT COUNT(*) FROM contractors WHERE active = true) as total_contractors,
          (SELECT COUNT(*) FROM customer_decisions WHERE status = 'pending') as pending_decisions
      `);

      res.json({
        projects: projects.rows,
        contractors: contractors.rows,
        stats: stats.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
