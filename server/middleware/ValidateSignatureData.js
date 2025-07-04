export const validateSignatureData = (req, res, next) => {
  const { fieldId, pageNumber } = req.body;
  
  if (!fieldId || !pageNumber) {
    return res.status(400).json({
      error: 'Missing required fields: fieldId, pageNumber'
    });
  }
  next();
};