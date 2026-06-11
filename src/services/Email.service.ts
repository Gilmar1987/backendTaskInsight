import { BrevoClient } from '@getbrevo/brevo';
import { env } from '../config/env';

class EmailService {
  private brevo: BrevoClient;

  constructor() {
    // Nova forma de instanciar o cliente central na v5
    this.brevo = new BrevoClient({
      apiKey: env.BREVO_API_KEY,
    });
  }

  async sendTaskCreatedEmail(user: { email: string; name: string }, task: { title: string; dueDate: Date | null }) {
  // Certifique-se de subir a imagem do raio com fundo roxo arredondado no seu servidor/repositório e colar a URL aqui
  const logoUrl = 'SUA_URL_DA_LOGO_AQUI'; 

  await this.brevo.transactionalEmails.sendTransacEmail({
    subject: `⚡ Nova tarefa atribuída: ${task.title}`,
    htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1924; padding: 40px 20px; color: #ffffff; line-height: 1.6; text-align: left;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #12111a; border-radius: 16px; overflow: hidden; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
          
          <div style="margin-bottom: 40px; display: flex; align-items: center; justify-content: center;">
            <table style="margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 12px;">
                  <img src="${logoUrl}" alt="⚡" style="height: 44px; width: auto; display: block; border-radius: 8px;" />
                </td>
                <td style="vertical-align: middle; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                  TaskFlow
                </td>
              </tr>
            </table>
          </div>
          
          <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 15px 0; color: #ffffff; line-height: 1.2;">
            Nova tarefa<br/>atribuída
          </h2>
          
          <p style="font-size: 16px; color: #9ca3af; margin: 0 0 30px 0; font-weight: 400;">
            Olá, <strong style="color: #ffffff; font-weight: 600;">${user.name}</strong>! Uma nova tarefa foi atribuída a você.
          </p>
          
          <div style="background-color: #1f1e29; border: 1px solid #2e2c3d; border-radius: 12px; padding: 16px 20px; margin-bottom: 25px;">
            <span style="font-size: 13px; color: #6b7280; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Tarefa</span>
            <strong style="font-size: 18px; color: #ffffff; font-weight: 600; display: block;">${task.title}</strong>
            
            ${task.dueDate ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2e2c3d;">
                <span style="font-size: 13px; color: #6b7280; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Prazo de Vencimento</span>
                <strong style="font-size: 16px; color: #f43f5e; font-weight: 600; display: block;">${task.dueDate.toLocaleDateString('pt-BR')}</strong>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0 40px 0;">
            <a href="${env.FRONTEND_URL}" target="_blank" style="background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 16px 0; font-size: 16px; font-weight: 600; border-radius: 12px; display: block; text-align: center; transition: background-color 0.2s; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
              Acessar TaskFlow <span style="color: #facc15; margin-left: 4px;">⚡</span>
            </a>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #1f1e29; padding-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5; max-width: 280px; margin: 0 auto;">
              Se você não esperava esta notificação, pode ignorar este email.
            </p>
          </div>
          
        </div>
      </div>
    `,
    sender: { 
      name: "TaskFlow Management", 
      email: env.SMTP_USER 
    },
    to: [{ email: user.email, name: user.name }]
  });

}

  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    await this.brevo.transactionalEmails.sendTransacEmail({
      subject: 'Recuperação de senha — TaskFlow Management',
      htmlContent: `<h2>Recuperação de senha</h2>
                   <p>Olá, <strong>${user.name}</strong>!</p>
                   <p>Clique no link abaixo para redefinir sua senha. O link é válido por <strong>1 hora</strong>.</p>
                   <a href="${resetUrl}">Redefinir senha</a>
                   <p>Se você não solicitou isso, ignore este email.</p>`,
      sender: { 
        name: "TaskFlow Management", 
        email: env.SMTP_USER 
      },
      to: [{ email: user.email, name: user.name }]
    });
  }
}

export const emailService = new EmailService();
export default emailService;
