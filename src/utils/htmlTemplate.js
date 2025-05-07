export function htmlTemplate() {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 50px auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333333;">Reset Your Password</h2>
          <p style="color: #555555; line-height: 1.5;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <a href="{{resetLink}}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; margin-top: 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #555555; line-height: 1.5; margin-top: 20px;">
            If you didn’t request this, you can safely ignore this email.
          </p>
          <div style="margin-top: 30px; font-size: 12px; color: #aaaaaa; text-align: center;">
            &copy; 2025 Your App. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    `;
  }
  