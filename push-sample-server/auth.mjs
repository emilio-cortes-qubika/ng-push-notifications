// Admin authentication middleware
export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = process.env.DEMO_ADMIN_TOKEN;

  if (authHeader !== `Bearer ${token}`) {
    return res.status(401).send('Unauthorized');
  }

  next();
};