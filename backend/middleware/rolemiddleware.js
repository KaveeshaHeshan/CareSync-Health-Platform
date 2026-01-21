// Check if user is patient
exports.isPatient = (req, res, next) => {
  if (req.user && req.user.role === 'PATIENT') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Patient role required.' 
  });
};

// Check if user is doctor
exports.isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'DOCTOR') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Doctor role required.' 
  });
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Admin role required.' 
  });
};

// Check if user is approved doctor
exports.isApprovedDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'DOCTOR' && req.user.isApproved) {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Approved doctor status required.' 
  });
};

// Check if user is either doctor or admin
exports.isDoctorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Doctor or Admin role required.' 
  });
};

// Check if user is either patient or admin
exports.isPatientOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Patient or Admin role required.' 
  });
};

// Check resource ownership (user can access their own data)
exports.checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Admin can access everything
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // User can only access their own data
    if (resourceUserId && resourceUserId === req.user.id) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. You can only access your own data.' 
    });
  };
};

// Check if user account is active
exports.checkActiveStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'User not authenticated' 
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({ 
      success: false,
      message: 'Account is inactive. Please contact support.' 
    });
  }

  next();
};

// Check if doctor is approved
exports.checkDoctorApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'User not authenticated' 
    });
  }

  if (req.user.role === 'DOCTOR' && !req.user.isApproved) {
    return res.status(403).json({ 
      success: false,
      message: 'Doctor account pending approval. Please wait for admin approval.' 
    });
  }

  next();
};