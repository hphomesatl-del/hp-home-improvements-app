const jwt = require('jsonwebtoken');

const SECRET = 'HPHI-2421-secure-key-change-in-prod';

module.exports = {
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(401);
    }

    jwt.verify(token, SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },
  
  login: (req, res) => {
    const { username, password } = req.body;
    if (username === 'HPHI' && password === '2421') {
      const token = jwt.sign({ username }, SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
};
