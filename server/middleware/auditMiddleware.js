import AuditLog from '../models/AuditLog.js';

export const logAction = (action) => {
  return async (req, res, next) => {
    try {
      // Skip logging for audit routes themselves
      if (req.originalUrl.startsWith('/api/audit')) return next();
      
      // Create log entry
      await AuditLog.create({
        document: req.params.documentId || req.body.documentId,
        user: req.user?._id,
        action,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          method: req.method,
          path: req.originalUrl,
          params: req.params,
          // Don't log full body for security
          bodyKeys: Object.keys(req.body) 
        }
      });
      
      next();
    } catch (error) {
      console.error('Audit logging failed:', error);
      next(); // Don't block request if logging fails
    }
  };
};

// Special middleware for signature actions
export const logSignature = async (req, res, next) => {
  try {
    await AuditLog.create({
      document: req.params.documentId,
      user: req.user?._id,
      action: 'sign',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        signatureId: req.params.signatureId,
        fieldLocation: req.body.coordinates // If available
      }
    });
    next();
  } catch (error) {
    console.error('Signature logging failed:', error);
    next();
  }
};