import * as SibApiV3Sdk from '@getbrevo/brevo';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@geekhoot.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Geekhoot';

function getBrevoClient(): SibApiV3Sdk.TransactionalEmailsApi | null {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY not configured. Email sending disabled.');
    return null;
  }
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
  return apiInstance;
}

export async function sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
  const codeHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 20px auto; color: #1e293b; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff5200; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em; text-transform: uppercase; font-style: italic;">Geekhoot</h1>
        <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Premium Printing Store</p>
      </div>
      
      <p style="font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">Hello <strong style="color: #0f172a;">${name}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">
        Thank you for signing up with Geekhoot. To complete your registration and activate your account, please enter the verification code below:
      </p>
      
      <div style="text-align: center; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0; letter-spacing: 6px; font-size: 28px; font-weight: 800; color: #ff5200; font-family: monospace;">
        ${code}
      </div>
      
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      
      <div style="text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500;">
        <p style="margin: 0 0 4px 0;">© 2026 Geekhoot. All rights reserved.</p>
        <p style="margin: 0;">Designed for high performance print processing.</p>
      </div>
    </div>
  `;

  // Log code to console for dev environments
  console.log(`\n📬 ================= VERIFICATION CODE LOG =================`);
  console.log(`👤 User: ${name} (${email})`);
  console.log(`🔑 Code: ${code}`);
  console.log(`===========================================================\n`);

  try {
    const apiInstance = getBrevoClient();
    if (!apiInstance) return false;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.subject = `[Geekhoot] Verify Your Account (${code})`;
    sendSmtpEmail.htmlContent = codeHtml;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`🚀 Brevo successfully sent verification email to ${email}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Brevo error sending email to ${email}:`, error?.message || error);
    return false;
  }
}
