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
    // Nova estrutura de chamada: brevo.transactionalEmails.sendTransacEmail()
    await this.brevo.transactionalEmails.sendTransacEmail({
      subject: `Nova tarefa atribuída: ${task.title}`,
      htmlContent: `<h1>Olá ${user.name},</h1>
                   <p>Uma nova tarefa foi atribuída a você:</p>
                   <ul>
                     <li><strong>Título:</strong> ${task.title}</li>
                     ${task.dueDate ? `<li><strong>Data de vencimento:</strong> ${task.dueDate.toLocaleDateString('pt-BR')}</li>` : ''}
                   </ul>
                   <p>Acesse o sistema para mais detalhes.</p>
                   <p>Atenciosamente,<br/>Equipe TaskInsight</p>`,
      sender: { 
        name: "TaskInsight", 
        email: env.SMTP_USER 
      },
      to: [{ email: user.email, name: user.name }]
    });
  }

  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    await this.brevo.transactionalEmails.sendTransacEmail({
      subject: 'Recuperação de senha — TaskInsight',
      htmlContent: `<h2>Recuperação de senha</h2>
                   <p>Olá, <strong>${user.name}</strong>!</p>
                   <p>Clique no link abaixo para redefinir sua senha. O link é válido por <strong>1 hora</strong>.</p>
                   <a href="${resetUrl}">Redefinir senha</a>
                   <p>Se você não solicitou isso, ignore este email.</p>`,
      sender: { 
        name: "TaskInsight", 
        email: env.SMTP_USER 
      },
      to: [{ email: user.email, name: user.name }]
    });
  }
}

export const emailService = new EmailService();
export default emailService;
