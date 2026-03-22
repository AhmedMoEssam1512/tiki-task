// backend/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Create nodemailer transporter
 * @returns {Transporter}
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send password reset email with OTP
 * @param {string} toEmail 
 * @param {string} username 
 * @param {string} otp 
 * @returns {Promise<object>}
 */
const sendPasswordResetEmail = async (toEmail, username, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Tiki Task'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: toEmail,
      subject: '🔐 Password Reset Request - Tiki Task',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🔐 Password Reset Request</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>You requested a password reset for your Tiki Task account.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password (OTP):</p>
            <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #27ae60; letter-spacing: 8px;">
              ${otp}
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">Valid for 15 minutes</p>
          </div>
          
          <p><strong>⚠️ Security Tips:</strong></p>
          <ul>
            <li>Never share this OTP with anyone</li>
            <li>Tiki Task staff will never ask for your OTP</li>
            <li>If you didn't request this, ignore this email</li>
          </ul>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The Tiki Task Team ⚽
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Password reset email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    logger.error(`❌ Failed to send email to ${toEmail}: ${error.message}`);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Test email connection (optional: use on startup)
 * @returns {Promise<boolean>}
 */
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('✅ SMTP connection verified');
    return true;
  } catch (error) {
    logger.error(`❌ SMTP connection failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConnection
};