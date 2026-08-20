const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"EduPro LMS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">EduPro LMS</h1>
      </div>
      <h2 style="color: #f8fafc; font-size: 22px;">Reset Your Password</h2>
      <p style="color: #94a3b8; line-height: 1.6;">You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: '🔐 Password Reset - EduPro LMS', html });
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0;">EduPro LMS</h1>
      </div>
      <h2 style="color: #f8fafc;">Welcome, ${name}! 🎉</h2>
      <p style="color: #94a3b8; line-height: 1.6;">Your account has been created successfully. Start learning and earning with EduPro LMS today!</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #6366f1; font-weight: 600; margin: 0 0 8px;">Next Steps:</p>
        <ul style="color: #94a3b8; padding-left: 20px; margin: 0;">
          <li>Complete your KYC verification</li>
          <li>Browse available courses</li>
          <li>Share your referral link to earn commissions</li>
        </ul>
      </div>
    </div>
  `;
  await sendEmail({ to: email, subject: '🎉 Welcome to EduPro LMS!', html });
};

exports.sendKycStatusEmail = async (email, name, status, reason = '') => {
  const isApproved = status === 'approved';
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
      <h1 style="color: #6366f1;">EduPro LMS</h1>
      <h2 style="color: ${isApproved ? '#10b981' : '#ef4444'};">
        KYC ${isApproved ? 'Approved ✅' : 'Rejected ❌'}
      </h2>
      <p style="color: #94a3b8;">Hi ${name}, your KYC verification has been ${status}.</p>
      ${!isApproved && reason ? `<p style="color: #fbbf24;">Reason: ${reason}</p>` : ''}
    </div>
  `;
  await sendEmail({ to: email, subject: `KYC ${isApproved ? 'Approved' : 'Rejected'} - EduPro LMS`, html });
};
