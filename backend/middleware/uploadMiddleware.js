const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads/prescriptions',
  'uploads/lab-results',
  'uploads/profile-pictures',
  'uploads/documents'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/documents'; // default
    
    // Determine upload path based on file type or route
    if (req.path.includes('prescription')) {
      uploadPath = 'uploads/prescriptions';
    } else if (req.path.includes('lab') || req.path.includes('result')) {
      uploadPath = 'uploads/lab-results';
    } else if (req.path.includes('profile') || req.path.includes('avatar')) {
      uploadPath = 'uploads/profile-pictures';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user.id : 'anonymous';
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${userId}_${uniqueSuffix}_${name}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: /jpeg|jpg|png|gif|webp/,
    document: /pdf|doc|docx|txt/,
    medical: /pdf|jpg|jpeg|png|dcm|dicom/ // Medical images
  };
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  // Check for profile pictures
  if (req.path.includes('profile') || req.path.includes('avatar')) {
    if (allowedTypes.image.test(ext) && /image\//.test(mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Only image files are allowed for profile pictures'), false);
  }
  
  // Check for prescriptions and lab results
  if (req.path.includes('prescription') || req.path.includes('lab') || req.path.includes('result')) {
    if ((allowedTypes.medical.test(ext) || allowedTypes.document.test(ext))) {
      return cb(null, true);
    }
    return cb(new Error('Only PDF, images, or medical files are allowed'), false);
  }
  
  // Default: allow common document types
  if (allowedTypes.document.test(ext) || allowedTypes.image.test(ext)) {
    return cb(null, true);
  }
  
  cb(new Error('Invalid file type'), false);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Export middleware for different use cases
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

// Specific upload middlewares
exports.uploadProfilePicture = upload.single('profilePicture');
exports.uploadPrescription = upload.single('prescription');
exports.uploadLabResult = upload.single('labResult');
exports.uploadDocument = upload.single('document');
exports.uploadMultipleDocuments = upload.array('documents', 5);

// Medical images upload (for lab results, X-rays, etc.)
exports.uploadMedicalImages = upload.array('medicalImages', 10);

// Helper function to delete file
exports.deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// Middleware to validate file was uploaded
exports.requireFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  next();
};

// Middleware to add file info to request
exports.processUpload = (req, res, next) => {
  if (req.file) {
    req.fileInfo = {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`
    };
  }
  
  if (req.files && Array.isArray(req.files)) {
    req.filesInfo = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
    }));
  }
  
  next();
};