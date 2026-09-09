import { EmailMessage } from '~common/email/email-sender.interface';

const PRODUCT_NAME = 'Fynans';

export interface AuthEmailRecipient {
  email: string;
  name?: string | null;
}

interface EmailAction {
  label: string;
  url: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function salutation(recipient: AuthEmailRecipient): string {
  const firstName = recipient.name?.trim().split(/\s+/)[0];
  return firstName ? `Hi ${firstName},` : 'Hi,';
}

function htmlBody(
  heading: string,
  paragraphs: string[],
  action: EmailAction,
): string {
  const safeUrl = escapeHtml(action.url);

  return [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#1B1B1F;max-width:520px">',
    `<h1 style="font-size:20px;margin:0 0 20px">${escapeHtml(heading)}</h1>`,
    ...paragraphs.map(
      (paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph)}</p>`,
    ),
    `<p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;background:#9A7209;color:#FFFFFF;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600">${escapeHtml(action.label)}</a></p>`,
    '<p style="margin:0 0 8px;color:#5B5F6E;font-size:13px">If the button does not work, paste this link into your browser:</p>',
    `<p style="margin:0;color:#5B5F6E;font-size:13px;word-break:break-all">${safeUrl}</p>`,
    '</div>',
  ].join('');
}

function textBody(paragraphs: string[], action: EmailAction): string {
  return [...paragraphs, '', `${action.label}: ${action.url}`].join('\n');
}

export function passwordResetEmail(
  recipient: AuthEmailRecipient,
  url: string,
  expiresInMinutes: number,
): EmailMessage {
  const action: EmailAction = { label: 'Choose a new password', url };
  const paragraphs = [
    salutation(recipient),
    `Someone asked to reset the password for your ${PRODUCT_NAME} account. Use the link below to choose a new one. It expires in ${expiresInMinutes} minutes and can only be used once.`,
    'If this was not you, ignore this email. Your password stays as it is.',
  ];

  return {
    to: recipient.email,
    subject: `Reset your ${PRODUCT_NAME} password`,
    html: htmlBody('Reset your password', paragraphs, action),
    text: textBody(paragraphs, action),
  };
}

export function emailVerificationEmail(
  recipient: AuthEmailRecipient,
  url: string,
): EmailMessage {
  const action: EmailAction = { label: 'Verify my email address', url };
  const paragraphs = [
    salutation(recipient),
    `Confirm this address so we can reach you about your ${PRODUCT_NAME} account and let you reset your password if you ever lose it.`,
    `If you did not create a ${PRODUCT_NAME} account, ignore this email.`,
  ];

  return {
    to: recipient.email,
    subject: `Verify your ${PRODUCT_NAME} email address`,
    html: htmlBody('Verify your email address', paragraphs, action),
    text: textBody(paragraphs, action),
  };
}
