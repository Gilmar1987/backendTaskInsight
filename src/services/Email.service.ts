import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  private baseTemplate(content: string) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TaskFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f0ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f0ff;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#7C3AED;border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;line-height:40px;">&#9889;</span>
                  </td>
                  <td style="padding-left:10px;font-size:22px;font-weight:700;color:#1e1b4b;vertical-align:middle;">TaskFlow</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} TaskFlow &mdash; Não responda este email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendTaskCreatedEmail(user: { email: string; name: string }, task: { title: string; dueDate: Date | null }) {
    const dueDateRow = task.dueDate
      ? `<tr>
           <td style="padding:10px 14px;border-bottom:1px solid #f3f0ff;">
             <span style="color:#6b7280;font-size:13px;">Vencimento</span><br/>
             <span style="color:#1e1b4b;font-weight:600;">${task.dueDate.toLocaleDateString('pt-BR')}</span>
           </td>
         </tr>`
      : '';

    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;color:#1e1b4b;">Nova tarefa atribuída</h1>
      <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Olá, <strong style="color:#1e1b4b;">${user.name}</strong>! Uma nova tarefa foi atribuída a você.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f7ff;border-radius:10px;border:1px solid #ede9fe;margin-bottom:28px;">
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f3f0ff;">
            <span style="color:#6b7280;font-size:13px;">Tarefa</span><br/>
            <span style="color:#1e1b4b;font-weight:600;font-size:16px;">${task.title}</span>
          </td>
        </tr>
        ${dueDateRow}
      </table>

      <div style="text-align:center;">
        <a href="${env.FRONTEND_URL}" style="display:inline-block;background-color:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
          Acessar TaskFlow &#9889;
        </a>
      </div>

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
        Se você não esperava esta notificação, pode ignorar este email.
      </p>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"TaskFlow" <${env.SMTP_USER}>`,
        to: user.email,
        subject: `⚡ Nova tarefa: ${task.title}`,
        html: this.baseTemplate(content),
      });
      console.log(`[Email] Tarefa criada enviado para ${user.email} — ID: ${info.messageId}`);
    } catch (error) {
      console.error(`[Email] Falha ao enviar email de tarefa para ${user.email}:`, error);
    }
  }

  async sendWelcomeEmail(user: { email: string; name: string }, confirmUrl: string) {
    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;color:#1e1b4b;">Bem-vindo ao TaskFlow! &#9889;</h1>
      <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Ol&aacute;, <strong style="color:#1e1b4b;">${user.name}</strong>! Sua conta foi criada com sucesso. Clique no bot&atilde;o abaixo para confirmar seu e-mail e come&ccedil;ar a usar o TaskFlow.</p>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="${confirmUrl}" style="display:inline-block;background-color:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
          Confirmar minha conta
        </a>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef9ff;border-radius:10px;border:1px solid #ede9fe;margin-bottom:20px;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0;font-size:13px;color:#7c3aed;font-weight:600;">&#8987; Link v&aacute;lido por 24 horas</p>
            <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Ap&oacute;s esse prazo, entre em contato com o suporte para reenviar o link.</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Se voc&ecirc; n&atilde;o criou esta conta, ignore este email &mdash; ela ser&aacute; removida automaticamente.
      </p>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"TaskFlow" <${env.SMTP_USER}>`,
        to: user.email,
        subject: '⚡ Confirme sua conta — TaskFlow',
        html: this.baseTemplate(content),
      });
      console.log(`[Email] Boas-vindas enviado para ${user.email} — ID: ${info.messageId}`);
    } catch (error) {
      console.error(`[Email] Falha ao enviar boas-vindas para ${user.email}:`, error);
    }
  }

  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;color:#1e1b4b;">Recuperação de senha</h1>
      <p style="margin:0 0 28px;color:#6b7280;font-size:15px;">Olá, <strong style="color:#1e1b4b;">${user.name}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta.</p>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="${resetUrl}" style="display:inline-block;background-color:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
          Redefinir minha senha
        </a>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef9ff;border-radius:10px;border:1px solid #ede9fe;margin-bottom:20px;">
        <tr>
          <td style="padding:14px 16px;">
            <p style="margin:0;font-size:13px;color:#7c3aed;font-weight:600;">&#9888; Link v&aacute;lido por 1 hora</p>
            <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Ap&oacute;s esse prazo, voc&ecirc; precisar&aacute; solicitar um novo link de recupera&ccedil;&atilde;o.</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Se voc&ecirc; n&atilde;o solicitou a recupera&ccedil;&atilde;o de senha, ignore este email &mdash; sua conta continua segura.
      </p>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"TaskFlow" <${env.SMTP_USER}>`,
        to: user.email,
        subject: '⚡ Recuperação de senha — TaskFlow',
        html: this.baseTemplate(content),
      });
      console.log(`[Email] Reset de senha enviado para ${user.email} — ID: ${info.messageId}`);
    } catch (error) {
      console.error(`[Email] Falha ao enviar reset de senha para ${user.email}:`, error);
    }
  }
}

export const emailService = new EmailService();