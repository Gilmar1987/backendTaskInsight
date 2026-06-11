import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  async sendTaskCreatedEmail(user: { email: string; name: string }, task: { title: string; dueDate: Date | null }) {
    await this.transporter.sendMail({

      from: `"TaskInsight" <${env.SMTP_USER}>`,
      to: user.email,
      subject: `Nova tarefa atribuída: ${task.title}`,
      html: `<h1>Olá ${user.name},</h1>
             <p>Uma nova tarefa foi atribuída a você:</p>
             <ul>
               <li><strong>Título:</strong> ${task.title}</li>
               ${task.dueDate ? `<li><strong>Data de vencimento:</strong> ${task.dueDate.toLocaleDateString('pt-BR')}</li>` : ''}
             </ul>
             <p>Acesse o sistema para mais detalhes.</p>
             <p>Atenciosamente,<br/>Equipe TaskInsight</p>`,

        headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    });
  }

  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    await this.transporter.sendMail({
      from: `"TaskInsight" <${env.SMTP_USER}>`,
      to: user.email,
      subject: 'Recuperação de senha — TaskInsight',
      html: `<h2>Recuperação de senha</h2>
             <p>Olá, <strong>${user.name}</strong>!</p>
             <p>Clique no link abaixo para redefinir sua senha. O link é válido por <strong>1 hora</strong>.</p>
             <a href="${resetUrl}">Redefinir senha</a>
             <p>Se você não solicitou isso, ignore este email.</p>`
    });
  }
}

export const emailService = new EmailService();