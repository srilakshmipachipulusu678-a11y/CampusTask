
const requirePrincipal = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  if (req.session.user.role !== "principal") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Principal only."
    });
  }

  req.user = req.session.user;
  next();
};

module.exports = requirePrincipal;
