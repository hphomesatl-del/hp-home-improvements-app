// Root endpoint for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'HP Home Improvements API is running!',
    endpoints: [
      '/api/health',
      '/api/customers',
      '/api/auth/login',
      '/api/projects'
    ],
    status: 'production'
  });
});