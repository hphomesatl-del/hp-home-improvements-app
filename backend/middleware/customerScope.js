const { authenticateToken } = require('./auth');

/**
 * Optional auth: sets user info if token present, guest if not.
 * Prevents unauthorized access by never defaulting to admin.
 * Routes must explicitly check authentication before allowing sensitive actions.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // No token provided — user is not authenticated
    req.userId = null;
    req.userEmail = null;
    req.userRole = 'guest'; // Changed from 'admin' to 'guest'
    return next();
  }
  return authenticateToken(req, res, next);
}

/**
 * Verifies that the authenticated customer owns the project referenced by :projectId.
 * Admins pass through. Customers must have customer_id or customer_email match.
 * Attaches req.verifiedProjectId on success.
 */
function verifyProjectOwnership(pool) {
  return async (req, res, next) => {
    // Admins can access everything
    if (req.userRole === 'admin') return next();

    const projectId = req.params.projectId || req.params.id || req.body?.project_id;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    try {
      const result = await pool.query(
        `SELECT id
         FROM projects
         WHERE id = $1
           AND (customer_id = $2 OR customer_email = $3 OR id = ANY($4::uuid[]))`,
        [projectId, req.userId, req.userEmail, req.userProjectIds || []]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.verifiedProjectId = projectId;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

/**
 * Returns all project IDs owned by the current customer.
 */
async function getCustomerProjectIds(pool, userId, userEmail, userProjectIds = []) {
  const result = await pool.query(
    'SELECT id FROM projects WHERE customer_id = $1 OR customer_email = $2 OR id = ANY($3::uuid[])',
    [userId, userEmail, userProjectIds]
  );
  return result.rows.map(r => r.id);
}

module.exports = { optionalAuth, verifyProjectOwnership, getCustomerProjectIds };
