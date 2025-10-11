import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ExpireTrack <noreply@expiretrack.com>',
    to: email,
    subject: 'Reset Your Password - ExpireTrack',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              padding: 40px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 15px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            p {
              margin: 15px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔐 Password Reset Request</h1>
            <p>Hello from ExpireTrack!</p>

            <div class="content">
              <p>We received a request to reset your password. Click the button below to create a new password:</p>

              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetLink}</p>

              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </div>

              <p>For security reasons, we never ask for your password via email.</p>
            </div>

            <div class="footer">
              <p>This email was sent by ExpireTrack</p>
              <p>Track expiry dates and reduce waste</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - ExpireTrack

      We received a request to reset your password.

      Click this link to reset your password:
      ${resetLink}

      This link will expire in 1 hour.

      If you didn't request this password reset, please ignore this email.

      - ExpireTrack Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send email verification email
export const sendVerificationEmail = async (email, verificationToken, userName) => {
  const transporter = createTransporter();

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ExpireTrack <noreply@expiretrack.com>',
    to: email,
    subject: 'Verify Your Email - ExpireTrack',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              padding: 40px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 15px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            p {
              margin: 15px 0;
            }
            .warning {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              color: #1565c0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✉️ Welcome to ExpireTrack!</h1>
            <p>Hello ${userName}!</p>

            <div class="content">
              <p>Thank you for registering! To complete your registration and start tracking expiry dates, please verify your email address by clicking the button below:</p>

              <center>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </center>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>

              <div class="warning">
                <strong>ℹ️ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with ExpireTrack, please ignore this email.
              </div>

              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Track expiry dates for your food items</li>
                <li>Upload and share product images</li>
                <li>Get notifications before items expire</li>
                <li>Reduce waste and save money</li>
              </ul>
            </div>

            <div class="footer">
              <p>This email was sent by ExpireTrack</p>
              <p>Track expiry dates and reduce waste</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to ExpireTrack!

      Hello ${userName}!

      Thank you for registering! To complete your registration, please verify your email address by clicking this link:
      ${verificationLink}

      This link will expire in 24 hours.

      If you didn't create an account with ExpireTrack, please ignore this email.

      - ExpireTrack Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export default {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
