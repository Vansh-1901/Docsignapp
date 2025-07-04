// Mock version (for development)
export const sendSignatureEmail = async (email, link) => {
  console.log(`\n--- Email to: ${email} ---`);
  console.log(`Subject: Please sign this document`);
  console.log(`Body: Click here to sign: ${link}\n`);
  return true;
};

/* Production version (using Nodemailer)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendSignatureEmail = async (email, link) => {
  const mailOptions = {
    from: 'no-reply@yourdomain.com',
    to: email,
    subject: 'Please sign this document',
    html: `<p>Click <a href="${link}">here</a> to sign the document</p>`
  };
  
  return transporter.sendMail(mailOptions);
};
*/