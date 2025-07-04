import crypto from 'crypto';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateExpiryDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};